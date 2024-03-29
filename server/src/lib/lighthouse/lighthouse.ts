import { join } from 'node:path';
import { TMP_DIR } from '../../config.js';
import * as serverState from '../../lib/server-state.js';
import {
  calculateCpuThrottling,
  asyncLighthouseCommand,
} from './lighthouse.utils.js';
import LighthouseHandler, {
  LIGHTHOUSE_HANDLER_STATES,
  LighthouseEvents,
  LighthouseCallbackDataType,
} from './LighthouseHandler.js';

import Section from '../../models/section.model.js';

type SectionInstance = {
  sectionSlug: string;
  handler: LighthouseHandler;
};

const sectionIntances: SectionInstance[] = [];

// Creates a LighthouseHandler instance for each section
(async () => await syncSections())();

export async function syncSections() {
  const sections = await Section.find().select('_id name slug weekSchedule');

  // Remove deleted sections
  for (let i = 0; i < sectionIntances.length; i++) {
    const sectionIntance = sectionIntances[i];

    if (!sections.find((s) => s.slug === sectionIntance.sectionSlug)) {
      sectionIntances.splice(i, 1);
      i--;
    }
  }

  // Update existing sections
  for (let i = 0; i < sectionIntances.length; i++) {
    const sectionInstance = sectionIntances[i];
    const section = sections.find(
      ({ slug }) => slug === sectionInstance.sectionSlug
    );

    sectionInstance.handler.sync(true);
  }

  // Add new sections
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];

    if (!sectionIntances.find((s) => s.sectionSlug === section.slug)) {
      const handler = new LighthouseHandler(section as Lhd.Section);

      handler.on('data-update', (data) => {
        emit('data-update', section.slug, data);
      });

      handler.on('section-state-update', (data) => {
        emit('section-state-update', section.slug, data);
      });

      handler.on('audit-complete', (data) => {
        emit('audit-complete', section.slug, data);
      });

      await handler.sync();

      sectionIntances.push({
        sectionSlug: section.slug,
        handler,
      });
    }
  }
}

/**
 * Helper function for getting section instance.
 */
const getSectionInstance = (slug: string) =>
  sectionIntances.find(({ sectionSlug }) => sectionSlug === slug);

/**
 * Triggers a section data sync with the database.
 */
export const syncSectionData = async (sectionSlug: string) => {
  const sectionIntance = getSectionInstance(sectionSlug);

  if (sectionIntance) {
    await sectionIntance.handler.sync();
  }
};

/**
 * Returns current state for section.
 */
export const getSectionState = (sectionSlug: string) => {
  const sectionIntance = getSectionInstance(sectionSlug);

  if (sectionIntance) {
    return sectionIntance.handler.state;
  }

  return LIGHTHOUSE_HANDLER_STATES.INVALID_SECTION;
};

/**
 * Gets fully populated data from selected Lighthouse instance.
 */
export const getSectionData = (sectionSlug: string) => {
  const sectionIntance = getSectionInstance(sectionSlug);

  if (sectionIntance) {
    return sectionIntance.handler.data;
  }

  return LIGHTHOUSE_HANDLER_STATES.INVALID_SECTION;
};

const incrementalId = (
  (i = 0) =>
  () =>
    i++
)();

type EventSubscription = {
  id: number;
  event: LighthouseEvents;
  section: string;
  callback: any;
  remove: () => void;
};

const subs: EventSubscription[] = [];

/**
 * Registers a subscription for section events.
 */
export function on<T extends LighthouseEvents>(
  event: T,
  section: string,
  callback: (data: LighthouseCallbackDataType<T>) => void
) {
  const sub = {
    id: incrementalId(),
    event,
    section,
    callback,
    remove: () => {
      const i = subs.map((i) => i.id).indexOf(sub.id);
      subs.splice(i, 1);
    },
  };

  subs.push(sub);

  return {
    id: sub.id,
    section: sub.section,
    remove: () => sub.remove(),
  };
}

/**
 * Emits data to subscriptions by event and section.
 */
export function emit<T extends LighthouseEvents>(
  event: T,
  section: string,
  data: LighthouseCallbackDataType<T>
) {
  subs
    .filter((sub) => sub.section === section)
    .filter((sub) => sub.event === event)
    .forEach((sub) => sub.callback(data));
}

/**
 * Gets all sections.
 */
export const getSections = () =>
  sectionIntances.map((section) => section.handler.section);

/**
 * Run audit in selected section instance.
 */
export const runAudit = (sectionSlug: string, id: string) => {
  const { state } = serverState.get();

  if (state === serverState.SERVER_STATE.ERROR) {
    return LIGHTHOUSE_HANDLER_STATES.SERVER_ERROR;
  }

  if (
    state === serverState.SERVER_STATE.CALIBRATING ||
    state === serverState.SERVER_STATE.INITIALIZING
  ) {
    return LIGHTHOUSE_HANDLER_STATES.SERVER_NOT_READY;
  }

  const sectionIntance = getSectionInstance(sectionSlug);

  if (!sectionIntance) {
    return LIGHTHOUSE_HANDLER_STATES.INVALID_SECTION;
  }

  const status = sectionIntance.handler.runAudit(id);

  return status;
};

/**
 * Run all audits in selected section instance.
 */
export const runAllAudits = (sectionSlug: string, onlyEmpty = false) => {
  const { state } = serverState.get();

  if (state === serverState.SERVER_STATE.ERROR) {
    return LIGHTHOUSE_HANDLER_STATES.SERVER_ERROR;
  }

  if (
    state === serverState.SERVER_STATE.CALIBRATING ||
    state === serverState.SERVER_STATE.INITIALIZING
  ) {
    return LIGHTHOUSE_HANDLER_STATES.SERVER_NOT_READY;
  }

  const sectionIntance = getSectionInstance(sectionSlug);

  if (!sectionIntance) {
    return LIGHTHOUSE_HANDLER_STATES.INVALID_SECTION;
  }

  sectionIntance.handler.runAllAudits(onlyEmpty);

  return LIGHTHOUSE_HANDLER_STATES.OK;
};

/**
 * Remove page from queue in selected section instance by id.
 */
export const removeQueuedAudit = (sectionSlug: string, id: string) => {
  const sectionIntance = getSectionInstance(sectionSlug);

  if (sectionIntance) {
    sectionIntance.handler.removeQueuedAudit(id);

    return LIGHTHOUSE_HANDLER_STATES.OK;
  }

  return LIGHTHOUSE_HANDLER_STATES.INVALID_SECTION;
};

/**
 * Remove all pages from queue in selected section instance.
 */
export const removeAllQueuedAudits = (sectionSlug: string) => {
  const sectionIntance = getSectionInstance(sectionSlug);

  if (sectionIntance) {
    sectionIntance.handler.removeAllQueuedAudits();

    return LIGHTHOUSE_HANDLER_STATES.OK;
  }

  return LIGHTHOUSE_HANDLER_STATES.INVALID_SECTION;
};

/**
 * This function will run a lighthouse audit and return the benchmarkIndex and
 * cpuThrottle, so that we can set an appropriate cpuThrottle for the
 * environment the application is running in.
 */

type CalibrationCallback = (
  data: {
    cpuThrottle: string | null;
    benchmarkIndex: number | null;
  },
  error?: any
) => void;

export const calibrate = (callback: CalibrationCallback) => {
  const url = 'https://www.google.com/';

  serverState.set({ state: serverState.SERVER_STATE.CALIBRATING });

  asyncLighthouseCommand({
    url,
    logFile: join(TMP_DIR, 'latest-calibration-run.log'),
  }).then(({ jsonReportContent }) => {
    let cpuThrottle = '1';

    try {
      const jsonData = JSON.parse(jsonReportContent);
      const benchmarkIndex = jsonData?.environment?.benchmarkIndex;

      if (!benchmarkIndex) {
        throw Error('Invalid benchmarkIndex - Lighthouse calibration failed?');
      }

      cpuThrottle = calculateCpuThrottling(benchmarkIndex);

      callback(
        {
          cpuThrottle,
          benchmarkIndex,
        },
        null
      );
    } catch (error) {
      callback(
        {
          cpuThrottle: null,
          benchmarkIndex: null,
        },
        error
      );
    }
  });
};
