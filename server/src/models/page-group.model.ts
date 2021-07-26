import { Document, Schema } from 'mongoose';
import { RequestError } from '@lib/RequestError';
import { mongoose } from '@db';
import { setDates, incrementVersion } from '@models/middleware';
import Section from '@models/section.model';
import Page from '@models/page.model';

interface IPageGroup extends Document {
  name: string;
  namePrefix: string;
  nameSuffix: string;
  section: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// Creating schema
const PageGroupSchema: Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    namePrefix: String,
    nameSuffix: String,
    section: mongoose.Types.ObjectId,
    createdAt: Date,
    updatedAt: Date,
  },
  {
    collection: 'pageGroups',
  }
);

// Schema hooks
PageGroupSchema.pre('save', async function (next) {
  const doc = this as IPageGroup;

  if (doc.isNew && !(await Section.findById(doc.section))) {
    return next(new RequestError('invalid_section', 400));
  }

  next();
});

// Cascade deletion hook
PageGroupSchema.pre('deleteMany', async function (next) {
  const query: any = this;
  const pageGroups = await query.find();

  if (pageGroups?.length) {
    const pageGroupIds = pageGroups.map((i: any) => i._id);

    console.log(`Delete PageGroups with ids: ${pageGroupIds.join(', ')}`);

    await Page.deleteMany({ pageGroup: { $in: pageGroupIds } });
  }

  next();
});

// Universal hooks
PageGroupSchema.pre('save', setDates);
PageGroupSchema.pre('save', incrementVersion);

const PageGroup = mongoose.model<IPageGroup>('PageGroup', PageGroupSchema);

export default PageGroup;
