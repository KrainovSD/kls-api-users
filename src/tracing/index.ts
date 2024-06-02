import {
  BatchSpanProcessor,
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { FastifyInstrumentation } from '@opentelemetry/instrumentation-fastify';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const exporter = process.env.OT_EXPORTER
  ? process.env.OT_EXPORTER.toLowerCase() === 'console'
    ? 'console'
    : 'outer'
  : 'console';
const traceConsoleExporter = new ConsoleSpanExporter();
const traceOuterExpoter = new OTLPTraceExporter({
  url: process.env.OT_EXPORTER_URL,
});
const spanProcessor =
  exporter === 'console'
    ? new SimpleSpanProcessor(traceConsoleExporter)
    : process.env.NODE_ENV === `development`
      ? new SimpleSpanProcessor(traceOuterExpoter)
      : new BatchSpanProcessor(traceOuterExpoter);

export const otelSDK = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: process.env.OT_SERVICE_NAME,
  }),
  spanProcessor,
  instrumentations: [
    new HttpInstrumentation(),
    new FastifyInstrumentation(),
    new NestInstrumentation(),
  ],
});

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () =>
        // eslint-disable-next-line no-console
        console.log(
          process.env.LOG_FORMAT === 'json'
            ? JSON.stringify({
                level: 'INFO',
                message: 'SDK shut down successfully',
              })
            : 'level=INFO message="SDK shut down successfully"',
        ),
      (err) =>
        // eslint-disable-next-line no-console
        console.log(
          process.env.LOG_FORMAT === 'json'
            ? JSON.stringify({
                level: 'ERROR',
                message: 'Error shutting down SDK',
                error: err?.name,
                description: err?.message,
              })
            : `level=ERROR message="Error shutting down SDK" error=${err?.name} description=${err?.message}`,
        ),
    )
    .finally(() => process.exit(0));
});
