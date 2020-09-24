import { RequestHandler } from 'express';
import * as passport from 'passport';
import * as passportAzureAd from 'passport-azure-ad';
import User from '@models/user.model';

declare global {
  namespace Express {
    export interface Request {
      currentUser: {
        id: string;
        email: string;
        role: number;
      };
    }
  }
}

passport.use(
  new passportAzureAd.BearerStrategy(
    {
      clientID: process.env.AUTH_AD_CLIENT_ID,
      audience: process.env.AUTH_AD_CLIENT_ID,
      passReqToCallback: true,
      identityMetadata: `https://login.microsoftonline.com/${process.env.AUTH_AD_ISSUER}/.well-known/openid-configuration`,
    },
    (req, payload, done) => {
      done(null, payload);
    }
  )
);

export enum USER_ROLES {
  NONE,
  VIEWER,
  USER,
  ADMIN,
  SUPERADMIN,
}

// TODO: User added tokens
const DUMMY_TOKEN = 'qwe123';

/**
 * We check the role that is passed to this middleware and check a number of
 * steps to determine if to pass the request through.
 */
export const ensureUserRole = (role: USER_ROLES): RequestHandler => async (
  req,
  res,
  next
) => {
  // If no role is required, we pass the request through
  if (role === USER_ROLES.NONE) {
    return next();
  }

  // If role VIEWER is required and view token is present
  if (role === USER_ROLES.VIEWER && req.query.token) {
    if (req.query.token === DUMMY_TOKEN) {
      return next();
    }

    return res.status(401).json('Unauthorized');
  }

  // Check if bearer token is present and get user role from database
  passport.authenticate(
    'oauth-bearer',
    { session: false },
    async (err, adUser, info) => {
      if (err || !adUser) {
        return res.status(401).json(info);
      }

      // If user is authenticated and required role is >= VIEWER, we let them
      // pass through
      if (role <= USER_ROLES.VIEWER) {
        return next();
      }

      // We look for a user with AD users unique_name and if user is found we
      // check the role of the user
      const user = await User.findOne({ email: adUser.unique_name });

      if (!user || user.role < role) {
        res.status(401).json('Unauthorized');
      } else {
        next();
      }
    }
  )(req, res, next);
};

/**
 * We check the role that is passed to this middleware and check a number of
 * steps to determine if to pass the request through.
 */
export const setCurrentUser = (): RequestHandler => async (req, res, next) => {
  // We default to NONE role
  req.currentUser = {
    id: null,
    email: null,
    role: USER_ROLES.NONE,
  };

  // If viewer token is available we verify it and update the role if good token
  if (req.query.token) {
    if (req.query.token === DUMMY_TOKEN) {
      req.currentUser.role = USER_ROLES.VIEWER;
    }
  }

  // We check if the user is authenticated for AD and gets its role if it exists
  passport.authenticate(
    'oauth-bearer',
    { session: false },
    async (err, adUser) => {
      if (err || !adUser) {
        return next();
      }

      req.currentUser.email = adUser.unique_name;
      req.currentUser.role = USER_ROLES.VIEWER;

      const user = await User.findOne({ email: adUser.unique_name });

      if (user?.role) {
        req.currentUser.role = Math.max(req.currentUser.role, user.role);
        req.currentUser.id = user._id;
      }

      next();
    }
  )(req, res, next);
};
