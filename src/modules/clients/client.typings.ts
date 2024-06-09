export type DefaultInfo = {
  operationId: string;
};

export type CreateStatisticOptions = {
  userId: string;
} & DefaultInfo;

export type DeleteStatisticsOptions = {
  userIds: string[];
} & DefaultInfo;

export type DeleteWordsOptions = {
  userIds: string[];
} & DefaultInfo;

export type CreateStatisticPayload = {
  userId: string;
};

export type DeleteStatisticsPayload = {
  userIds: string[];
};

export type DeleteWordsPayload = {
  userIds: string[];
};

export type SendMessageToMicroserviceOptions = {
  microservice: string;
  pattern: string;
  value: unknown;
} & DefaultInfo;

export type SendEventToMicroserviceOptions = {
  microservice: string;
  pattern: string;
  value: unknown;
} & DefaultInfo;
