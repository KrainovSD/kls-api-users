import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { MailerService as Mailer } from '@nestjs-modules/mailer';
import { LOGGER_TOKEN, LoggerService } from '@krainovsd/nest-logger-service';

import { MAIL_LOGIN } from '@config';

import { SendMailOptions } from './mailer.typings';

@Injectable()
export class MailerService {
  constructor(
    @Inject(LOGGER_TOKEN)
    private readonly loggerService: LoggerService,
    private readonly mailerService: Mailer,
  ) {}

  async sendMail({ code, email, subject, text }: SendMailOptions) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: MAIL_LOGIN,
        subject,
        text: `${text.trim()}: ${code.trim()}`,
        html: `${text.trim()}: ${code.trim()}`,
      });
    } catch (error) {
      this.loggerService.error({ error, message: 'error send email' });
      throw new ConflictException("Couldn't send email");
    }
  }
}
