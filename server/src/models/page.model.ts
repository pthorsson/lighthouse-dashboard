import { URL } from 'node:url';
import { setDates, incrementVersion } from '../models/middleware/index.js';
import { RequestError } from '../lib/RequestError.js';
import { mongoose } from '../db.js';

import Audit from '../models/audit.model.js';
import PageGroup from '../models/page-group.model.js';

interface IPage extends mongoose.Document {
  url: string;
  pageGroup: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// Creating schema
const PageSchema: mongoose.Schema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      validate: {
        validator: (value: any) => {
          try {
            new URL(value);
            return true;
          } catch (error) {
            return false;
          }
        },
        message: 'Invalid URL',
      },
    },
    pageGroup: mongoose.Types.ObjectId,
    createdAt: Date,
    updatedAt: Date,
  },
  {
    collection: 'pages',
  }
);

// Schema hooks
PageSchema.pre('save', async function (next) {
  const doc = this as IPage;

  if (doc.isNew && !(await PageGroup.findById(doc.pageGroup))) {
    return next(new RequestError('invalid_page_group', 400));
  }

  next();
});

// Cascade deletion hook
PageSchema.pre('deleteMany', async function (next) {
  const query: any = this;
  const pages = await query.find();

  if (pages?.length) {
    const pageIds = pages.map((i: any) => i._id);

    console.log(`Delete Pages with ids: ${pageIds.join(', ')}`);

    await Audit.deleteMany({ page: { $in: pageIds } });
  }

  next();
});

// Universal hooks
PageSchema.pre('save', setDates);
PageSchema.pre('save', incrementVersion);

const Page = mongoose.model<IPage>('Page', PageSchema);

export default Page;
