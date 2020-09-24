import { RequestHandler } from 'express';
import * as lighthouse from '@lib/lighthouse';
import Page from '@models/page.model';
import PageGroup from '@models/page-group.model';
import Section from '@models/section.model';

export const getAll: RequestHandler = async (req, res) => {
  const pages = await Page.find();
  res.json(pages);
};

export const create: RequestHandler = async (req, res, next) => {
  const { url, pageGroup: pgid } = req.body;

  try {
    const page = await Page.create({
      url,
      pageGroup: pgid,
    });

    // Find section for updating Lighthouse instance
    const pageGroup = await PageGroup.findOne({ _id: pgid });
    const section = await Section.findOne({ _id: pageGroup.section });

    await lighthouse.syncSectionData(section.slug);

    res.json(page.id);
  } catch (err) {
    next(err);
  }
};

export const remove: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Find section for updating Lighthouse instance
    const page = await Page.findOne({ _id: id });
    const pageGroup = await PageGroup.findOne({ _id: page.pageGroup });
    const section = await Section.findOne({ _id: pageGroup.section });

    const { deletedCount } = await Page.deleteMany({ _id: id });

    await lighthouse.syncSectionData(section.slug);

    if (deletedCount) {
      return res.json(`Removed page with id ${id}`);
    }

    return res.status(404).json('Not found');
  } catch (err) {
    next(err);
  }
};
