import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LOGGER_TOKEN, LoggerService } from '@krainovsd/nest-logger-service';
import { timeout } from 'rxjs';
import { events, statistics, words } from './client.constants';
import { services } from '../../const';
import {
  ClientsKeys,
  CreateStatisticOptions,
  CreateStatisticPayload,
  DeleteStatisticsOptions,
  DeleteStatisticsPayload,
  DeleteWordsOptions,
  DeleteWordsPayload,
  SendEventToMicroserviceOptions,
  SendMessageToMicroserviceOptions,
} from './client.typings';

@Injectable()
export class ClientService {
  private clients: Record<ClientsKeys, ClientProxy> = {
    statistics: this.clientStatistics,
    words: this.clientWords,
  };

  constructor(
    @Inject(services.statistics.alias) private clientStatistics: ClientProxy,
    @Inject(services.words.alias) private clientWords: ClientProxy,

    @Inject(LOGGER_TOKEN)
    private readonly logger: LoggerService,
  ) {}

  private async sendMessageToMicroservice<T extends unknown>({
    microservice,
    operationId,
    pattern,
    value,
  }: SendMessageToMicroserviceOptions): Promise<T | undefined> {
    const loggerInfo = {
      consumer: microservice,
      data: JSON.stringify(value),
      pattern,
      operationId,
      traceId: await this.logger.getTraceId(),
    };
    this.logger.debug({ info: loggerInfo, message: 'start rpc message' });

    return new Promise((resolve) => {
      this.clients[microservice]
        .send(pattern, value)
        .pipe(timeout(5000))
        .subscribe({
          next: (result) => {
            this.logger.debug({ info: loggerInfo, message: 'end rpc message' });
            resolve(result);
          },
          error: (error) => {
            this.logger.error({
              error,
              info: loggerInfo,
              message: 'error rpc message',
            });
            resolve(undefined);
          },
        });
    });
  }
  private async sendEventToMicroservice({
    microservice,
    operationId,
    pattern,
    value,
  }: SendEventToMicroserviceOptions) {
    this.logger.debug({
      info: {
        consumer: microservice,
        pattern,
        operationId,
        traceId: await this.logger.getTraceId(),
      },
      message: 'send rpc event',
    });

    this.clients[microservice].emit(pattern, value);
  }

  async createStatistics({ operationId, userId }: CreateStatisticOptions) {
    const args: CreateStatisticPayload = {
      userId,
    };
    await this.sendEventToMicroservice({
      microservice: statistics,
      pattern: events.createStatistics,
      value: args,
      operationId,
    });
  }

  async deleteStatistics({ operationId, userIds }: DeleteStatisticsOptions) {
    const args: DeleteStatisticsPayload = {
      userIds,
    };
    await this.sendEventToMicroservice({
      microservice: statistics,
      pattern: events.deleteStatistics,
      value: args,
      operationId,
    });
  }

  async deleteWords({ operationId, userIds }: DeleteWordsOptions) {
    const args: DeleteWordsPayload = {
      userIds,
    };
    await this.sendEventToMicroservice({
      microservice: words,
      pattern: events.deleteWords,
      value: args,
      operationId,
    });
  }
}
