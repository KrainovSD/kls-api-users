import { ModuleOptions } from './s3.typings';

export interface S3OptionsFactory {
  createOptions(): Promise<ModuleOptions> | ModuleOptions;
}
