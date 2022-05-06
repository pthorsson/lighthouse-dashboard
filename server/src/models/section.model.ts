import { setDates, incrementVersion } from '../models/middleware/index.js';
import { mongoose } from '../db.js';

import PageGroup from '../models/page-group.model.js';

interface ISection extends mongoose.Document {
  name: string;
  slug: string;
  weekSchedule: number[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Creating schema
const SectionSchema: mongoose.Schema = new mongoose.Schema(
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
    weekSchedule: {
      type: [Number],
      default: [-1, -1, -1, -1, -1, -1, -1],
      validate: [
        {
          validator: (value: number[]) => value.length === 7,
          message: 'weekSchedule array must contain 7 numbers',
        },
        {
          validator: (value: number[]) =>
            value.every((hour) => hour >= -1 && hour <= 23),
          message: 'weekSchedule array item must be between -1 and 23',
        },
      ],
    },
    createdAt: Date,
    updatedAt: Date,
  },
  {
    collection: 'sections',
  }
);

// Cascade deletion hook
SectionSchema.pre('deleteMany', async function (next) {
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
