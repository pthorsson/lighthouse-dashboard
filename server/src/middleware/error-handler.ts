import { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  try {
    console.log('err', err);
    // Invalid JSON in body-parser
    if (err?.type === 'entity.verify.failed') {
      return res.status(400).json('Invalid json');
    }

    // MongoDB not unique
    if (err?.code === 11000) {
      return res.status(400).json({
        type: 'not_unique',
        message: 'Value already exists',
        path: Object.keys(err.keyValue)[0],
      });
    }

    // Mongoose validation error
    if (err?.kind || (err?.errors && Object.keys(err.errors)[0])) {
      const error = err.kind
        ? err
        : { ...err.errors[Object.keys(err.errors)[0]] };

      return res.status(400).json({
        type: error.kind,
        message:
          error.kind === 'user defined'
            ? error.properties.message
            : error.message,
        path: error.path,
      });
    }

    // Custom error RequestError
    if (err.name === 'RequestError') {
      res.status(err.statusCode).json({
        message: err.message,
      });
    }

    console.log(
      '=== UNHANDELED ERROR ===\n',
      err,
      '\n========================'
    );

    throw Error('Unhandled error case');
  } catch (err) {
    res.status(500).json({
      type: 'internal_server_error',
      message: 'Something went wrong :(',
    });
  }
};
