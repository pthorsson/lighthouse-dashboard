import { debounce } from 'lodash';
import { createLogger, createTimer, encodeBase64, delay } from '@lib/utils';
import * as serverState from '@lib/server-state';
import { asyncLighthouseCommand } from './lighthouse.utils';
import fetch from 'node-fetch';

import Section from '@models/section.model';
import PageGroup from '@models/page-group.model';
import Page from '@models/page.model';
import Audit from '@models/audit.model';
import Report from '@models/report.model';

// Response statuses of addind audits
export enum LIGHTHOUSE_HANDLER_STATES {
  OK = 'OK',
  ALREADY_ACTIVE = 'ALREADY_ACTIVE',
  INVALID_ID = 'INVALID_ID',
  INVALID_SECTION = 'INVALID_SECTION',
  SERVER_NOT_READY = 'SERVER_NOT_READY',
  SERVER_ERROR = 'SERVER_ERROR',
}

export type LighthouseEvents =
  | 'section-state-update'
  | 'data-update'
  | 'audit-complete';

type StateUpdateCallbackData = { state: LighthouseState };
type DataUpdateCallbackData = { section: Lhd.Section };
type AuditCompleteCallbackData = {
  audit: Lhd.Audit;
  deletedAudits: string[];
};

export type LighthouseCallbackDataType<T> = T extends 'section-state-update'
  ? StateUpdateCallbackData
  : T extends 'data-update'
  ? DataUpdateCallbackData
  : T extends 'audit-complete'
  ? AuditCompleteCallbackData
  : any;

type LighthouseSubscription = {
  event: LighthouseEvents;
  callback: any;
};

export type LighthouseState = {
  active: string;
  queue: string[];
};

/**
 * The LighthouseHandler handles Lighthouse runs and data handling for given
 * section.
 */
export default class LighthouseHandler {
  private _section: Lhd.Section;
  private _pageGroups: Lhd.PageGroup[] = [];
  private _pages: Lhd.Page[] = [];
  private _audits: Lhd.Audit[] = [];

  // Event subscriptions
  private _subs: LighthouseSubscription[] = [];

  // Instance state
  private _state: LighthouseState;

  // Log function
  private log: (message: string) => void;

  constructor(section: Lhd.Section) {
    this._section = {
      _id: section._id,
      name: section.name,
      slug: section.slug,
    };
    this.log = createLogger(`lighthouse-handler#${this._section.slug}`);
    this._state = {
      active: null,
      queue: [],
    };
  }

  /**
   * Registers a subscription for events.
   */
  public on<T extends LighthouseEvents>(
    event: T,
    callback: (data: LighthouseCallbackDataType<T>) => void
  ) {
    this._subs.push({ event, callback: debounce(callback) });
  }

  /**
   * Emits data to subscriptions by event.
   */
  public emit<T extends LighthouseEvents>(
    event: T,
    data: LighthouseCallbackDataType<T>
  ) {
    this._subs
      .filter((sub) => sub.event === event)
      .forEach((sub) => sub.callback(data));
  }

  /**
   * Fetches all data from data and updates instance cache.
   */
  public async sync(syncSection = false) {
    if (syncSection) {
      // Conditionally load section

      const section = await Section.findOne({
        slug: this._section.slug,
      }).select('_id name slug');

      this._section = {
        _id: section._id.toHexString(),
        name: section.name,
        slug: section.slug,
      };
    }

    // Load page groups

    const pageGroups = await PageGroup.find({
      section: this._section._id,
    }).select('_id name namePrefix nameSuffix section');

    this._pageGroups = pageGroups.map((pg) => ({
      _id: pg._id.toHexString(),
      name: pg.name,
      namePrefix: pg.namePrefix,
      nameSuffix: pg.nameSuffix,
      section: pg.section.toHexString(),
    }));

    // Load pages

    const pages = await Page.find({
      pageGroup: { $in: this._pageGroups.map((p) => p._id) },
    }).select('_id url pageGroup');

    this._pages = pages.map((p) => ({
      _id: p._id.toHexString(),
      url: p.url,
      pageGroup: p.pageGroup.toHexString(),
    }));

    // Load audits

    const audits = await Audit.find({
      page: { $in: this._pages.map((p) => p._id) },
    }).select(
      '_id timestamp duration performance accessibility bestPractices seo page'
    );

    this._audits = audits.map((a) => ({
      _id: a._id.toHexString(),
      timestamp: a.timestamp,
      duration: a.duration,
      performance: a.performance,
      accessibility: a.accessibility,
      bestPractices: a.bestPractices,
      seo: a.seo,
      page: a.page.toHexString(),
    }));

    this.emit('data-update', { section: this.data });
  }

  public get data(): Lhd.Section {
    const section: Lhd.Section = { ...this._section, pageGroups: [] };

    // Populate page groups
    this._pageGroups.forEach((pg) => {
      const pageGroup: Lhd.PageGroup = { ...pg, pages: [] };

      // Populate pages and sort them after URL
      this._pages
        .filter((p) => p.pageGroup === pageGroup._id)
        .sort((a, b) => {
          if (a.url > b.url) return 1;
          if (a.url < b.url) return -1;
          return 0;
        })
        .forEach((p) => {
          const page: Lhd.Page = { ...p, audits: [] };

          // Populate audits
          this._audits
            .filter((a) => a.page === page._id)
            .sort((a, b) => b.timestamp - a.timestamp)
            .forEach((a) => {
              page.audits.push({ ...a });
            });

          pageGroup.pages.push(page);
        });

      section.pageGroups.push(pageGroup);
    });

    section.pageGroups = section.pageGroups.sort((a, b) => {
      const combinedA = `${a.namePrefix || ' '}${a.name}${a.nameSuffix}`;
      const combinedB = `${b.namePrefix || ' '}${b.name}${b.nameSuffix}`;

      if (combinedA > combinedB) return 1;
      if (combinedA < combinedB) return -1;
      return 0;
    });

    return section;
  }

  /**
   * Returns section data
   */
  public get section() {
    return {
      _id: this._section._id,
      name: this._section.name,
      slug: this._section.slug,
    };
  }

  /**
   * Returns a copy of the state
   */
  public get state() {
    return {
      active: this._state.active,
      queue: [...this._state.queue],
    };
  }

  /**
   * Updates and emits state.
   */
  private setState(data: Partial<LighthouseState>) {
    this._state = {
      ...this.state,
      ...data,
    };

    this.emit('section-state-update', { state: this.state });
  }

  /**
   * Adds page to audit queue by id.
   */
  public runAudit(id: string) {
    const { active, queue } = this.state;

    if (queue.indexOf(id) > -1 || active === id) {
      return LIGHTHOUSE_HANDLER_STATES.ALREADY_ACTIVE;
    }

    if (!this._pages.find((page) => page._id === id)) {
      return LIGHTHOUSE_HANDLER_STATES.INVALID_ID;
    }

    this.setState({ queue: [...queue, id] });

    this.execQueue();

    return LIGHTHOUSE_HANDLER_STATES.OK;
  }

  /**
   * Adds all pages to audit queue.
   */
  public runAllAudits(onlyEmpty = false) {
    const { active, queue } = this.state;

    const ids: string[] = [];

    // We grab the pages from the get data method to get them sorted.
    this.data.pageGroups.forEach((pg) => {
      ids.push(
        ...pg.pages
          .filter((page) => !onlyEmpty || (onlyEmpty && !page.audits.length))
          .filter(
            (page) => queue.indexOf(page._id) === -1 && page._id !== active
          )
          .map((page) => page._id)
      );
    });

    this.setState({ queue: [...queue, ...ids] });

    this.execQueue();
  }

  /**
   * Removes page from audit queue by id.
   */
  public removeQueuedAudit(id: string) {
    const { queue } = this.state;

    const clearedQueue = queue.filter((pageId) => pageId !== id);

    if (queue.length && clearedQueue.length === queue.length) return;

    this.setState({
      queue: clearedQueue,
    });
  }

  /**
   * Removes all pages from audit queue.
   */
  public removeAllQueuedAudits() {
    this.setState({
      queue: [],
    });
  }

  /**
   * Triggers execution on queue, if it's not already been triggered.
   */
  private async execQueue() {
    if (this.state.active) return;

    while (this.state.queue.length) {
      const queue = this.state.queue;
      const id = queue.shift();

      this.setState({ active: id, queue });
      const page = this._pages.find((page) => page._id === id);

      // Pre fetch page to create possible cache
      await this.preFetchUrl(page.url);

      // Slight delay after pre fetch
      await delay(1000);

      // Execute Lighthouse audit
      const result = await this.execLighthouse(page.url);

      if (result) {
        const page = this._pages.find((page) => page._id === id);

        const auditDoc = await Audit.create({
          ...result.audit,
          page: page._id,
        });

        const encodedHtml = encodeBase64(result.htmlReportContent);
        const encodedJson = encodeBase64(result.jsonReportContent);

        await Report.create({ audit: auditDoc._id, encodedHtml, encodedJson });

        const audit: Lhd.Audit = {
          _id: auditDoc._id.toHexString(),
          timestamp: auditDoc.timestamp,
          duration: auditDoc.duration,
          performance: auditDoc.performance,
          accessibility: auditDoc.accessibility,
          bestPractices: auditDoc.bestPractices,
          seo: auditDoc.seo,
          page: page._id,
        };

        this._audits.push(audit);

        const deletedAudits = this._audits
          .filter((a) => a.page === page._id)
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(5)
          .map((a) => a._id);

        this._audits = this._audits.filter(
          (a) => deletedAudits.indexOf(a._id) === -1
        );

        this.emit('audit-complete', { audit, deletedAudits });
      }
    }

    this.setState({ active: null });
  }

  /**
   * Pre fetch page so that the audit won't be affected by a caching delay
   */
  private async preFetchUrl(url: string) {
    this.log(`Prefetching url: ${url} ...`);
    await fetch(url);
    this.log(`Prefetching complete`);
  }

  /**
   * Execute async Lighthouse run
   */
  private async execLighthouse(url: string) {
    const getTimePassed = createTimer();
    const timestamp = new Date().getTime();

    const { cpuThrottle } = serverState.get();

    // Execute lighthouse run
    this.log(
      `Running lighthouse on ${url} with cpuThrottle set to ${cpuThrottle.toFixed(
        1
      )} ...`
    );
    const results = await asyncLighthouseCommand(url, cpuThrottle);
    const duration = getTimePassed();

    if (!results) {
      this.log(`Audit failed after ${duration / 1000} seconds`);
      return null;
    }

    this.log(`Audit completed successfully after ${duration / 1000} seconds`);

    return {
      audit: {
        timestamp,
        duration,
        ...results.score,
      },
      jsonReportContent: results.jsonReportContent,
      htmlReportContent: results.htmlReportContent,
    };
  }
}
