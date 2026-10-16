import createHttpError from 'http-errors';

export const validateBody = (schema) => async (req, res, next) => {
  try {
    // value містить уже очищені дані (trim, lowercase)
    req.body = await schema.validateAsync(req.body ?? {}, {
      abortEarly: false,
    });
    next();
  } catch (error) {
    next(
      createHttpError(400, 'Bad Request', {
        errors: error.details.map((detail) => detail.message),
      }),
    );
  }
};
