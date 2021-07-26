import LighthouseHandler, {
  LIGHTHOUSE_HANDLER_STATES,
  LighthouseEvents,
  LighthouseCallbackDataType,
} from './LighthouseHandler';

import Section from '@models/section.model';

type SectionInstance = {
  sectionSlug: string;
  handler: LighthouseHandler;
};

const sectionIntances: SectionInstance[] = [];

// Creates a LighthouseHandler instance for each section
(async () => await syncSections())();

export async function syncSections() {
  const sections = await Section.find().select('_id name slug');

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

    if (sectionInstance.handler.section.name !== section.name) {
      sectionInstance.handler.sync(true);
    }
  }

  // Add new sections
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];

    if (!sectionIntances.find((s) => s.sectionSlug === section.slug)) {
      const handler = new LighthouseHandler(section as Lhd.Section);

      handler.on('data-update', (data) => {
        emit('data-update', section.slug, data);
      });

      handler.on('state-update', (data) => {
        emit('state-update', section.slug, data);
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
export const getState = (sectionSlug: string) => {
  const sectionIntance = getSectionInstance(sectionSlug);

  if (sectionIntance) {
    return sectionIntance.handler.state;
  }

  return LIGHTHOUSE_HANDLER_STATES.INVALID_SECTION;
};

/**
 * Gets fully populated data from selected Lighthouse instance.
 */
export const getData = (sectionSlug: string) => {
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
  const sectionIntance = getSectionInstance(sectionSlug);

  if (sectionIntance) {
    const status = sectionIntance.handler.runAudit(id);

    return status;
  }

  return LIGHTHOUSE_HANDLER_STATES.INVALID_SECTION;
};

/**
 * Run all audits in selected section instance.
 */
export const runAllAudits = (sectionSlug: string, onlyEmpty = false) => {
  const sectionIntance = getSectionInstance(sectionSlug);

  if (sectionIntance) {
    sectionIntance.handler.runAllAudits(onlyEmpty);

    return LIGHTHOUSE_HANDLER_STATES.OK;
  }

  return LIGHTHOUSE_HANDLER_STATES.INVALID_SECTION;
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
 * Helper function for getting section instance.
 */
const getSectionInstance = (slug: string) =>
  sectionIntances.find(({ sectionSlug }) => sectionSlug === slug);
