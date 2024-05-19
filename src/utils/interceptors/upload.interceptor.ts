import { writeFile } from 'fs/promises';
import { FastifyRequest } from 'fastify';
import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  mixin,
  Type,
} from '@nestjs/common';
import { v4 } from 'uuid';
import { Observable } from 'rxjs';
import { fsOperation } from '../helpers';

type TUploadInterceptor = {
  fieldName: string;
  mimeTypes: RegExp;
  limits: number;
  pathToSave: string;
};

export function UploadInterceptor({
  fieldName,
  limits,
  mimeTypes,
  pathToSave,
}: TUploadInterceptor) {
  class UploadInterceptorClass implements NestInterceptor {
    async intercept(
      ctx: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<unknown>> {
      if (!fieldName) throw new BadRequestException('not expected field');

      const req = ctx.switchToHttp().getRequest() as FastifyRequest;
      const isMultipart = req.isMultipart();
      if (!isMultipart)
        throw new BadRequestException('multipart/form-data expected.');

      const file = await req.file({
        limits: {
          fileSize: limits,
        },
      });
      if (!file) throw new BadRequestException('file expected');
      if (fieldName.toLowerCase() !== file.fieldname.toLowerCase())
        throw new BadRequestException('current field not expected');
      if (!mimeTypes.test(file.mimetype))
        throw new BadRequestException('not expected mimetype');

      const buffer = await file.toBuffer();
      const fileName = `${v4()}.${file.filename.split('.').pop()}`;

      await fsOperation.checkOrCreateFolder(pathToSave);
      await writeFile(`${pathToSave}/${fileName}`, buffer, 'binary');

      req.incomingFileName = fileName;
      return next.handle();
    }
  }
  const Interceptor = mixin(UploadInterceptorClass);
  return Interceptor as Type<NestInterceptor>;
}
