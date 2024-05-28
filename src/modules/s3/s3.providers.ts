import { Provider } from '@nestjs/common';
import { S3_INSTANCE_TOKEN, S3_OPTIONS_TOKEN, S3_TOKEN } from './s3.constants';
import { S3ConnectionService, S3Service } from './s3.service';
import { ModuleOptions } from './s3.typings';

export const connectionFactory: Provider = {
  provide: S3_INSTANCE_TOKEN,
  useFactory: async (service: S3ConnectionService) => service.connect(),
  inject: [S3ConnectionService],
};

export const serviceProvider: Provider = {
  provide: S3_TOKEN,
  useClass: S3Service,
};

export const optionProvider = (options: ModuleOptions): Provider => ({
  provide: S3_OPTIONS_TOKEN,
  useValue: options,
});
