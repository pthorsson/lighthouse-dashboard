import { Document, Schema } from 'mongoose';
import { RequestError } from '@lib/RequestError';
import { mongoose } from '@db';
import * as reportCache from '@lib/report-cache';
import { setDates, incrementVersion } from '@models/middleware';
import Page from '@models/page.model';
import Report from '@models/report.model';

interface IAudit extends Document {
  timestamp: number;
  duration: number;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  page: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// Creating schema
const AuditSchema: Schema = new mongoose.Schema(
  {
    timestamp: Number,
    duration: Number,
    performance: Number,
    accessibility: Number,
    bestPractices: Number,
    seo: Number,
    page: mongoose.Types.ObjectId,
    createdAt: Date,
    updatedAt: Date,
  },
  {
    collection: 'audits',
  }
);

// Schema hooks
AuditSchema.pre('save', async function (next) {
  const doc = this as IAudit;

  if (doc.isNew && !(await Page.findById(doc.page))) {
    return next(new RequestError('invalid_page', 400));
  }

  next();
});

// Limit to 5 audits per page
AuditSchema.pre('save', async function (next) {
  const doc = this as IAudit;

  const existingAudits = await doc.collection
    .find({ page: doc.page })
    .toArray();

  const auditsToRemove = existingAudits
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(4)
    .map((a) => a._id);

  if (auditsToRemove.length) {
    await Audit.deleteMany({ _id: { $in: auditsToRemove } });
  }

  next();
});

// Cascade deletion hook
AuditSchema.pre('deleteMany', async function (next) {
  const query: any = this;
  const audits = await query.find();

  if (audits?.length) {
    const auditIds = audits.map((i: any) => i._id);

    console.log(`Delete Audits with ids: ${auditIds.join(', ')}`);

    auditIds.forEach(reportCache.remove);

    await Report.deleteMany({ audit: { $in: auditIds } });
  }

  next();
});

// Universal hooks
AuditSchema.pre('save', setDates);
AuditSchema.pre('save', incrementVersion);

const Audit = mongoose.model<IAudit>('Audit', AuditSchema);

export default Audit;
