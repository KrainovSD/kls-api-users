import { Global, Module } from '@nestjs/common';

import { ModuleOptions } from './s3.typings';
import {
  connectionFactory,
  optionProvider,
  serviceProvider,
} from './s3.providers';

@Global()
@Module({})
export class S3Module {
  public static forRoot(options: ModuleOptions) {
    return {
      module: S3Module,
      providers: [optionProvider(options), connectionFactory, serviceProvider],
      exports: [serviceProvider, connectionFactory],
    };
  }
}
