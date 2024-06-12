import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

if (!process.env.POSTGRES_HOST) {
  throw new Error('POSTGRES_HOST env is not defined');
}
if (!process.env.POSTGRES_USER) {
  throw new Error('POSTGRES_USER env is not defined');
}
if (!process.env.POSTGRES_DB) {
  throw new Error('POSTGRES_DB env is not defined');
}
if (!process.env.POSTGRES_PASSWORD) {
  throw new Error('POSTGRES_PASSWORD env is not defined');
}
if (!process.env.POSTGRES_PORT) {
  throw new Error('POSTGRES_PORT env is not defined');
}
if (!process.env.REDIS_HOST) {
  throw new Error('REDIS_HOST env is not defined');
}
if (!process.env.REDIS_PORT) {
  throw new Error('REDIS_PORT env is not defined');
}
if (!process.env.REDIS_PASSWORD) {
  throw new Error('REDIS_PASSWORD env is not defined');
}
if (!process.env.MAIL_LOGIN) {
  throw new Error('MAIL_LOGIN env is not defined');
}
if (!process.env.MAIL_PASSWORD) {
  throw new Error('MAIL_PASSWORD env is not defined');
}
if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET env is not defined');
}
if (!process.env.REFRESH_TOKEN_SECRET) {
  throw new Error('REFRESH_TOKEN_SECRET env is not defined');
}
if (!process.env.COOKIE_SECRET) {
  throw new Error('COOKIE_SECRET env is not defined');
}
if (!process.env.SWAGGER_BASIC_AUTH) {
  throw new Error('SWAGGER_BASIC_AUTH env is not defined');
}
if (!process.env.SWAGGER_ACCOUNT_ID) {
  throw new Error('SWAGGER_ACCOUNT_ID env is not defined');
}
if (!process.env.RABBIT_HOST) {
  throw new Error('RABBIT_HOST env is not defined');
}
if (!process.env.RABBIT_PORT) {
  throw new Error('RABBIT_PORT env is not defined');
}
if (!process.env.RABBIT_PROTOCOL) {
  throw new Error('RABBIT_PROTOCOL env is not defined');
}
if (!process.env.RABBIT_USER) {
  throw new Error('RABBIT_USER env is not defined');
}
if (!process.env.RABBIT_PASSWORD) {
  throw new Error('RABBIT_PASSWORD env is not defined');
}
if (!process.env.LOG_LEVEL) {
  throw new Error('LOG_LEVEL env is not defined');
}
if (
  !process.env.LOG_FORMAT ||
  (process.env.LOG_FORMAT &&
    process.env.LOG_FORMAT.toLowerCase() !== 'logfmt' &&
    process.env.LOG_FORMAT.toLowerCase() !== 'json')
) {
  throw new Error('LOG_FORMAT env is not defined');
}
if (!process.env.PORT) {
  throw new Error('PORT env is not defined');
}
if (!process.env.EXPIRES_ACCESS_TOKEN) {
  throw new Error('EXPIRES_ACCESS_TOKEN env is not defined');
}
if (!process.env.EXPIRES_REFRESH_TOKEN) {
  throw new Error('EXPIRES_REFRESH_TOKEN env is not defined');
}
if (!process.env.S3_REGION) {
  throw new Error('S3_REGION env is not defined');
}
if (!process.env.S3_ENDPOINT) {
  throw new Error('S3_ENDPOINT env is not defined');
}
if (!process.env.S3_ACCESS_KEY) {
  throw new Error('S3_ACCESS_KEY env is not defined');
}
if (!process.env.S3_SECRET_KEY) {
  throw new Error('S3_SECRET_KEY env is not defined');
}
if (!process.env.S3_BUCKET) {
  throw new Error('S3_BUCKET env is not defined');
}

if (!process.env.COOKIE_NAME_REFRESH_TOKEN) {
  throw new Error('COOKIE_NAME_REFRESH_TOKEN env is not defined');
}

export const POSTGRES_HOST = process.env.POSTGRES_HOST;
export const POSTGRES_USER = process.env.POSTGRES_USER;
export const POSTGRES_DB = process.env.POSTGRES_DB;
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
export const POSTGRES_PORT = +process.env.POSTGRES_PORT;
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = +process.env.REDIS_PORT;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
export const MAIL_LOGIN = process.env.MAIL_LOGIN;
export const MAIL_PASSWORD = process.env.MAIL_PASSWORD;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const COOKIE_SECRET = process.env.COOKIE_SECRET;
export const SWAGGER_BASIC_AUTH = process.env.SWAGGER_BASIC_AUTH;
export const SWAGGER_ACCOUNT_ID = process.env.SWAGGER_ACCOUNT_ID;
export const RABBIT_HOST = process.env.RABBIT_HOST;
export const RABBIT_PORT = +process.env.RABBIT_PORT;
export const RABBIT_PROTOCOL = process.env.RABBIT_PROTOCOL;
export const RABBIT_USER = process.env.RABBIT_USER;
export const RABBIT_PASSWORD = process.env.RABBIT_PASSWORD;
export const LOG_LEVEL = process.env.LOG_LEVEL;
export const LOG_FORMAT = process.env.LOG_FORMAT.toLowerCase();
export const PORT = +process.env.PORT;
export const EXPIRES_ACCESS_TOKEN = process.env.EXPIRES_ACCESS_TOKEN;
export const EXPIRES_REFRESH_TOKEN = process.env.EXPIRES_REFRESH_TOKEN;
export const S3_REGION = process.env.S3_REGION;
export const S3_ENDPOINT = process.env.S3_ENDPOINT;
export const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY;
export const S3_SECRET_KEY = process.env.S3_SECRET_KEY;
export const S3_BUCKET = process.env.S3_BUCKET;
export const COOKIE_NAME_ACCESS_TOKEN = process.env.COOKIE_NAME_ACCESS_TOKEN;
export const COOKIE_NAME_REFRESH_TOKEN = process.env.COOKIE_NAME_REFRESH_TOKEN;
