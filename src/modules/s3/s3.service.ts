import { Inject, Injectable } from '@nestjs/common';
import { S3 } from '@aws-sdk/client-s3';
import { LOGGER_TOKEN, LoggerService } from '@krainovsd/nest-logger-service';

import {
  DeleteItemOptions,
  GetItemOptions,
  ModuleOptions,
  PutItemOptions,
} from './s3.typings';
import { InjectS3Instance, InjectS3Options } from './s3.decorators';

@Injectable()
export class S3Service {
  constructor(
    @Inject(LOGGER_TOKEN)
    private readonly loggerService: LoggerService,
    @InjectS3Options()
    private readonly options: ModuleOptions,
    @InjectS3Instance()
    private readonly s3: S3,
  ) {}

  async getItem({ key }: GetItemOptions) {
    try {
      const response = await this.s3.getObject(
        {
          Bucket: this.options.bucket,
          Key: key,
        },
        { requestTimeout: 15000 },
      );
      if (!response.Body) throw new Error('Body is empty');
      return response.Body;
    } catch {
      return null;
    }
  }

  async putItem({ key, payload }: PutItemOptions) {
    try {
      await this.s3.putObject(
        {
          Bucket: this.options.bucket,
          Key: key,
          Body: payload,
        },
        { requestTimeout: 15000 },
      );
      return true;
    } catch {
      return false;
    }
  }

  async deleteItem({ key }: DeleteItemOptions) {
    try {
      await this.s3.deleteObject(
        {
          Bucket: this.options.bucket,
          Key: key,
        },
        { requestTimeout: 15000 },
      );
      return true;
    } catch {
      return false;
    }
  }
}

@Injectable()
export class S3ConnectionService {
  constructor(
    @Inject(LOGGER_TOKEN)
    private readonly loggerService: LoggerService,
    @InjectS3Options()
    private readonly options: ModuleOptions,
  ) {}

  async connect() {
    const client = new S3(this.options);
    await this.initBucket(client);
    return client;
  }

  private async initBucket(client: S3) {
    if (!(await this.checkBucketExist(client))) await this.createBucket(client);
  }

  private async createBucket(client: S3) {
    try {
      await client.createBucket({ Bucket: this.options.bucket });
    } catch (error) {
      this.loggerService.error({ error, message: 'error create s3 bucket' });
      throw new Error('error create s3 bucket');
    }
  }

  private async checkBucketExist(client: S3) {
    try {
      await client.headBucket({ Bucket: this.options.bucket });
      return true;
    } catch (error) {
      this.loggerService.warn({ error, message: 'error exist s3 bucket' });
      return false;
    }
  }
}
