import { Injectable } from '@nestjs/common';
import { MailerService as Mailer } from '@nestjs-modules/mailer';

import { MAIL_LOGIN } from '../../config';
import { SendMailOptions } from './mailer.typings';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: Mailer) {}

  async sendMail({ code, email, subject, text }: SendMailOptions) {
    await this.mailerService.sendMail({
      to: email,
      from: MAIL_LOGIN,
      subject,
      text: `${text.trim()}: ${code.trim()}`,
      html: `${text.trim()}: ${code.trim()}`,
    });
  }
}
