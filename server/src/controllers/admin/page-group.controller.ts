import { RequestHandler } from 'express';
import * as lighthouse from '@lib/lighthouse';
import PageGroup from '@models/page-group.model';
import Section from '@models/section.model';

export const getAll: RequestHandler = async (req, res) => {
  const pageGroups = await PageGroup.find();
  res.json(pageGroups);
};

export const create: RequestHandler = async (req, res, next) => {
  const { name, namePrefix, nameSuffix, section: sid } = req.body;

  try {
    const pageGroup = await PageGroup.create({
      name,
      namePrefix,
      nameSuffix,
      section: sid,
    });

    // Find section for updating Lighthouse instance
    const section = await Section.findOne({ _id: sid });

    await lighthouse.syncSectionData(section.slug);

    res.json(pageGroup.id);
  } catch (err) {
    next(err);
  }
};

export const remove: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Find section for updating Lighthouse instance
    const pageGroup = await PageGroup.findOne({ _id: id });
    const section = await Section.findOne({ _id: pageGroup.section });

    const { deletedCount } = await PageGroup.deleteMany({ _id: id });

    await lighthouse.syncSectionData(section.slug);

    if (deletedCount) {
      return res.json(`Removed page group with id ${id}`);
    }

    return res.status(404).json('Not found');
  } catch (err) {
    next(err);
  }
};

export const update: RequestHandler[] = [
  async (req, res, next) => {
    const { id } = req.params;
    const { namePrefix, name, nameSuffix } = req.body;

    const pageGroup = await PageGroup.findOne({ _id: id });

    if (pageGroup) {
      try {
        const section = await Section.findOne({ _id: pageGroup.section });

        pageGroup.namePrefix = namePrefix;
        pageGroup.name = name;
        pageGroup.nameSuffix = nameSuffix;

        await pageGroup.save();
        await lighthouse.syncSectionData(section.slug);

        return res.json('OK');
      } catch (err) {
        next(err);
      }
    }

    res.status(404).json('Section not found');
  },
];
