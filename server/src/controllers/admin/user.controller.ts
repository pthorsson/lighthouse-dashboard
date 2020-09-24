import { RequestHandler } from 'express';
import User from '@models/user.model';

export const getAll: RequestHandler[] = [
  async (req, res, next) => {
    const sections = await User.find();
    res.json(sections);
  },
];

export const create: RequestHandler[] = [
  async (req, res, next) => {
    const { email, role } = req.body;

    try {
      const user = await User.create({ email, role });

      res.json(user.id);
    } catch (err) {
      next(err);
    }
  },
];

export const remove: RequestHandler[] = [
  async (req, res, next) => {
    const { id } = req.params;

    try {
      await User.deleteMany({ _id: id });

      return res.status(404).json('Not found');
    } catch (err) {
      next(err);
    }
  },
];

export const update: RequestHandler[] = [
  async (req, res, next) => {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findOne({ _id: id });

    if (user) {
      try {
        user.role = role || user.role;

        await user.save();

        return res.json('OK');
      } catch (err) {
        next(err);
      }
    }

    res.status(404).json('User not found');
  },
];
