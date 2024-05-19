import { MailerModule as Mailer } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { MAIL_LOGIN, MAIL_PASSWORD } from '../../config';
import { MailerService } from './mailer.service';

@Global()
@Module({
  imports: [
    Mailer.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        tls: {
          rejectUnauthorized: false,
        },
        auth: {
          user: MAIL_LOGIN,
          pass: MAIL_PASSWORD,
        },
      },
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
