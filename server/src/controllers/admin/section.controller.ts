import { RequestHandler } from 'express';
import Section from '@models/section.model';

import * as lighthouse from '@lib/lighthouse';

export const getAll: RequestHandler[] = [
  async (req, res, next) => {
    const sections = await Section.find();
    res.json(sections);
  },
];

export const create: RequestHandler[] = [
  async (req, res, next) => {
    const { name, slug } = req.body;

    try {
      const section = await Section.create({ name, slug });

      await lighthouse.syncSections();

      res.json(section.id);
    } catch (err) {
      next(err);
    }
  },
];

export const remove: RequestHandler[] = [
  async (req, res, next) => {
    const { id } = req.params;

    try {
      const { deletedCount } = await Section.deleteMany({ _id: id });

      if (deletedCount) {
        await lighthouse.syncSections();

        return res.json(`Removed section with id ${id}`);
      }

      return res.status(404).json('Not found');
    } catch (err) {
      next(err);
    }
  },
];

export const update: RequestHandler[] = [
  async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;

    const section = await Section.findOne({ _id: id });

    if (section) {
      try {
        section.name = name || section.name;

        await section.save();
        await lighthouse.syncSections();

        return res.json('OK');
      } catch (err) {
        next(err);
      }
    }

    res.status(404).json('Section not found');
  },
];
