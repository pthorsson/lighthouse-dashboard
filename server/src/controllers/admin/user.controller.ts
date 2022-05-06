import { RequestHandler } from 'express';
import { generateString } from '../../lib/utils.js';
import User from '../../models/user.model.js';
import Token from '../../models/token.model.js';
import { USER_ROLES } from '../../middleware/index.js';

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
      await Token.deleteMany({ user: id });
      await User.deleteMany({ _id: id });

      return res.json('OK');
    } catch (err) {
      next(err);
    }
  },
];

export const update: RequestHandler[] = [
  async (req, res, next) => {
    const { id } = req.params;
    const { role, email } = req.body;

    const user = await User.findOne({ _id: id });

    if (user) {
      try {
        user.email = email;
        user.role = role;

        await user.save();

        return res.json('OK');
      } catch (err) {
        return next(err);
      }
    }

    res.status(404).json('User not found');
  },
];

export const getTokens: RequestHandler[] = [
  async (req, res, next) => {
    if (req.currentUser.id) {
      const tokens = await Token.find({ user: req.currentUser.id });

      return res.json(tokens);
    }

    res.status(401).json('Unauthorized');
  },
];

export const createToken: RequestHandler[] = [
  async (req, res, next) => {
    const { role } = req.body;

    if (req.currentUser.id) {
      try {
        const generatedToken = generateString(90, 110);

        // Ensure role is less than current users and max Admin level
        const tokenRole = Math.min(
          role,
          Math.min(req.currentUser.role, USER_ROLES.SUPERADMIN) - 1
        );

        const token = await Token.create({
          token: generatedToken,
          user: req.currentUser.id,
          role: tokenRole,
        });

        return res.json(token.token);
      } catch (err) {
        return next(err);
      }
    }

    res.status(401).json('Unauthorized');
  },
];

export const removeToken: RequestHandler[] = [
  async (req, res, next) => {
    const { tokenId } = req.params;

    const token = await Token.findOne({
      _id: tokenId,
      user: req.currentUser.id,
    });

    if (token) {
      try {
        const { deletedCount } = await Token.deleteMany({ _id: token._id });

        return deletedCount
          ? res.json('OK')
          : res.status(404).json('Token not found');
      } catch (err) {
        return next(err);
      }
    }

    res.status(404).json('Token not found');
  },
];
