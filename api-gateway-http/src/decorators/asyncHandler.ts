import { Request, Response, NextFunction } from 'express';

import { AsyncHandler as AsyncHandlerType } from '../types/asyncHandler';

export function AsyncHandler(
  target: object,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<AsyncHandlerType>,
): TypedPropertyDescriptor<AsyncHandlerType> | void {
  const originalMethod = descriptor.value!;

  descriptor.value = function (req: Request, res: Response, next: NextFunction) {
    return Promise.resolve(originalMethod.call(this, req, res, next)).catch(next);
  };

  return descriptor;
}
