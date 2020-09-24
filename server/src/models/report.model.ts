import { Document, Schema, Error } from 'mongoose';
import { mongoose } from '@db';
import { setDates, incrementVersion } from '@models/middleware';
import Audit from '@models/audit.model';

interface IReport extends Document {
  encodedHtml: string;
  encodedJson: string;
  audit: mongoose.Types.ObjectId;
}

// Creating schema
const ReportSchema: Schema = new mongoose.Schema(
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
ReportSchema.pre('save', async function(next) {
  const doc = this as IReport;

  if (doc.isNew && !(await Audit.findById(doc.audit))) {
    return next(
      new Error.ValidatorError({
        type: 'invalid_section',
        path: 'audit',
        message: 'Invalid audit id',
      })
    );
  }

  next();
});

// Cascade deletion hook
ReportSchema.pre('deleteMany', async function(next) {
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
