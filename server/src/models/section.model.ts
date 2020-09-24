import { Document, Schema } from 'mongoose';
import { mongoose } from '@db';
import { setDates, incrementVersion } from '@models/middleware';
import PageGroup from '@models/page-group.model';

interface ISection extends Document {
  name: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Creating schema
const SectionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (value: string) => /^[a-z0-9-]+$/.test(value),
        message: 'Section slug can only contain a-z, 0-9 and -',
      },
    },
    createdAt: Date,
    updatedAt: Date,
  },
  {
    collection: 'sections',
  }
);

// Cascade deletion hook
SectionSchema.pre('deleteMany', async function(next) {
  const query: any = this;
  const sections = await query.find();

  if (sections?.length) {
    const sectionIds = sections.map((i: any) => i._id);

    console.log(`Delete Sections with ids: ${sectionIds.join(', ')}`);

    await PageGroup.deleteMany({ section: { $in: sectionIds } });
  }

  next();
});

// Universal hooks
SectionSchema.pre('save', setDates);
SectionSchema.pre('save', incrementVersion);

const Section = mongoose.model<ISection>('Section', SectionSchema);

export default Section;
