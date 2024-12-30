import * as Joi from 'joi';

export const BibleSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  content: Joi.string().required(),
  status: Joi.string().required(),
  quantity: Joi.number().required(),
});
