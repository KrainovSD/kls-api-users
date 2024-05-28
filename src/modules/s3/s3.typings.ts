import { S3ClientConfig } from '@aws-sdk/client-s3';

export type DefaultInfo = {
  operationId: string;
};
type StreamingBlobPayloadInputTypes = string | Uint8Array | Buffer;

export type GetItemOptions = { key: string } & DefaultInfo;
export type PutItemOptions = {
  key: string;
  payload: StreamingBlobPayloadInputTypes;
} & DefaultInfo;
export type DeleteItemOptions = { key: string } & DefaultInfo;

export type ModuleOptions = {
  bucket: string;
} & S3ClientConfig;
