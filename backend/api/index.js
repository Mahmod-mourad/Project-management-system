/**
 * Vercel Serverless entrypoint for the ERP / Project Management API.
 *
 * Mirrors src/main.ts (CORS from FRONTEND_URL, global prefix api/v1, validation
 * pipe, swagger) but skips `listen()` — Vercel drives the Express instance per
 * request instead.
 *
 * The real-time notification gateway degrades gracefully in this environment:
 * socket.io cannot hold long-lived connections on serverless, so the frontend's
 * socket client logs a connect_error and the app continues over REST polling.
 */
const express = require('express');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const { ValidationPipe } = require('@nestjs/common');
const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');
const { AppModule } = require('../dist/app.module');

let appPromise = null;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      const server = express();
      const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

      app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
      });

      app.setGlobalPrefix('api/v1');
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );

      await app.init();

      const config = new DocumentBuilder()
        .setTitle('ERP System API')
        .setDescription('Complete ERP System API with multi-tenant support')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);

      return app;
    })().catch((error) => {
      appPromise = null;
      throw error;
    });
  }
  return appPromise;
}

module.exports = async (req, res) => {
  try {
    const app = await getApp();
    const instance = app.getHttpAdapter().getInstance();
    return instance(req, res);
  } catch (error) {
    console.error('Serverless handler failed:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: 'Internal server error' }));
  }
};
