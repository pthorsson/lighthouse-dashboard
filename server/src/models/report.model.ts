import { setDates, incrementVersion } from '../models/middleware/index.js';
import { RequestError } from '../lib/RequestError.js';
import { mongoose } from '../db.js';

import Audit from '../models/audit.model.js';

interface IReport extends mongoose.Document {
  encodedHtml: string;
  encodedJson: string;
  audit: mongoose.Types.ObjectId;
}

// Creating schema
const ReportSchema: mongoose.Schema = new mongoose.Schema(
  {
    encodedHtml: String,
    encodedJson: String,
    audit: mongoose.Types.ObjectId,
    createdAt: Date,
    updatedAt: Date,
  },
  {
    collection: 'reports',
  }
);

// Schema hooks
ReportSchema.pre('save', async function (next) {
  const doc = this as IReport;

  if (doc.isNew && !(await Audit.findById(doc.audit))) {
    return next(new RequestError('invalid_audit', 400));
  }

  next();
});

// Cascade deletion hook
ReportSchema.pre('deleteMany', async function (next) {
  const query: any = this;
  const reports = await query.find();

  if (reports?.length) {
    const reportIds = reports.map((i: any) => i._id);

    console.log(`Delete Reports with ids: ${reportIds.join(', ')}`);
  }

  next();
});

// Universal hooks
ReportSchema.pre('save', setDates);
ReportSchema.pre('save', incrementVersion);

const Report = mongoose.model<IReport>('Report', ReportSchema);

export default Report;
