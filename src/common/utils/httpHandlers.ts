import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z, ZodError, ZodObject, ZodRawShape } from 'zod';

import {
  ResponseStatus,
  ServiceResponse,
} from '@/common/models/serviceResponse';

// Hàm để chuẩn hóa cách trả về response cho tất cả api endpoints, đảm bảo cấu trúc response đồng nhất
export const handleServiceResponse = (
  serviceResponse: ServiceResponse<any>,
  response: Response
) => {
  return response.status(serviceResponse.statusCode).send(serviceResponse);
};

// Middleware để validate request dựa trên schema được cung cấp
export const validateRequest =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(
        'Validating request with schema:',
        schema.parse({
          body: req.body,
          query: req.query,
          params: req.params,
        })
      );
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      // Kiểm tra nếu là ZodError
      if (err instanceof ZodError) {
        const errorMessage = `Invalid input: ${err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')}`;
        const statusCode = StatusCodes.BAD_REQUEST;
        res
          .status(statusCode)
          .send(
            new ServiceResponse<null>(
              ResponseStatus.Failed,
              errorMessage,
              null,
              statusCode
            )
          );
      } else {
        // Xử lý các lỗi khác
        const errorMessage = 'Validation failed';
        const statusCode = StatusCodes.BAD_REQUEST;
        res
          .status(statusCode)
          .send(
            new ServiceResponse<null>(
              ResponseStatus.Failed,
              errorMessage,
              null,
              statusCode
            )
          );
      }
    }
  };

export const validateHandle =
  (schema: ZodObject<ZodRawShape>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorMessage = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');

      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          new ServiceResponse<null>(
            ResponseStatus.Failed,
            `Invalid body: ${errorMessage}`,
            null,
            StatusCodes.BAD_REQUEST
          )
        );
    }
    req.body = result.data;
    next();
  };
