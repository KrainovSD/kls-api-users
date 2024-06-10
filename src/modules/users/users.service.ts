import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { utils } from '@krainovsd/utils';
import { hash as getHash } from 'bcryptjs';

import {
  DATA_CHANGE_TIMEOUT,
  EMAIL_CHANGE_TIME,
  ERROR_MESSAGES,
  MAIL_MESSAGES_OPTION,
  NICK_NAME_CHANGE_TIMEOUT,
  PASSWORD_CHANGE_TIME,
  RESPONSE_MESSAGES,
  SALT_ROUNDS,
} from '@constants';

import {
  CallChangeEmailOptions,
  CallChangePassOptions,
  ChangeEmailOptions,
  ChangeNickNameOptions,
  ChangePassOptions,
  CheckUniqueEmailOptions,
  CheckUniqueNickNameOptions,
  ClearAvatarOptions,
  ClearWallpaperOptions,
  CreateOptions,
  DeleteAllOptions,
  DeleteOptions,
  UpdateAvatarOptions,
  UpdateWallpaperOptions,
} from './users.typings';
import { SettingsService } from '../settings';
import { MailerService } from '../mailer';
import { ClientService } from '../clients';
import { UsersDatabase } from './users.database';

@Injectable()
export class UsersService {
  constructor(
    private readonly settingService: SettingsService,
    private readonly mailerService: MailerService,
    private readonly clientService: ClientService,
    readonly usersDatabase: UsersDatabase,
  ) {}

  async callChangePass({ email, userId, ...rest }: CallChangePassOptions) {
    const user = await this.usersDatabase.getByEmail(email, rest);
    if (!user) throw new BadRequestException(ERROR_MESSAGES.badEmail);

    if (user.passwordChangeDate) {
      const lastDateChange = utils.date.getDate(
        DATA_CHANGE_TIMEOUT,
        'seconds',
        user.passwordChangeDate,
      );
      if (lastDateChange > new Date())
        throw new BadRequestException(ERROR_MESSAGES.oftenChangeData);
    }
    if (user.passwordChangeTime && user.passwordChangeTime > new Date())
      throw new BadRequestException(ERROR_MESSAGES.oftenTryChange);

    user.passwordChangeKey = utils.common.getRandomId();
    user.passwordChangeTime = utils.date.getDate(
      PASSWORD_CHANGE_TIME,
      'seconds',
    );
    await user.save();
    await this.mailerService.sendMail({
      subject: MAIL_MESSAGES_OPTION.changePassword.title,
      text: MAIL_MESSAGES_OPTION.changePassword.message,
      code: user.passwordChangeKey,
      email,
      ...rest,
    });

    return RESPONSE_MESSAGES.sendEmail;
  }
  async changePass({ userId, dto, ...rest }: ChangePassOptions) {
    const user = await this.usersDatabase.getByPasswordChangeKey(dto.key, rest);
    if (
      !user ||
      (user &&
        user.passwordChangeTime &&
        user.passwordChangeTime < new Date()) ||
      (user && !user.passwordChangeTime)
    )
      throw new BadRequestException(ERROR_MESSAGES.badKeyOrTime);

    const hash = await getHash(dto.password, SALT_ROUNDS);
    user.hash = hash;
    user.passwordChangeDate = new Date();
    user.passwordChangeKey = null;
    user.passwordChangeTime = null;
    await user.save();

    return RESPONSE_MESSAGES.success;
  }

  async callChangeEmail({ userId, ...rest }: CallChangeEmailOptions) {
    const user = await this.usersDatabase.getByIdWithSettings(userId, rest);

    if (!user || !user.email)
      throw new BadRequestException(ERROR_MESSAGES.userNotFound);

    if (user.emailChangeDate) {
      const lastDateChange = utils.date.getDate(
        DATA_CHANGE_TIMEOUT,
        'seconds',
        user.emailChangeDate,
      );
      if (lastDateChange > new Date())
        throw new BadRequestException(ERROR_MESSAGES.oftenChangeData);
    }
    if (user.emailChangeTime && user.emailChangeTime > new Date())
      throw new BadRequestException(ERROR_MESSAGES.oftenTryChange);

    user.emailChangeKey = utils.common.getRandomId();
    user.emailChangeTime = utils.date.getDate(EMAIL_CHANGE_TIME, 'seconds');
    await user.save();
    await this.mailerService.sendMail({
      subject: MAIL_MESSAGES_OPTION.callChangeEmail.title,
      text: MAIL_MESSAGES_OPTION.callChangeEmail.message,
      code: user.emailChangeKey,
      email: user.email,
      ...rest,
    });

    return RESPONSE_MESSAGES.sendEmail;
  }
  async changeEmail({ dto, userId, ...rest }: ChangeEmailOptions) {
    const user = await this.usersDatabase.getByEmailChangeKey(dto.key, rest);

    if (
      !user ||
      (user && user.emailChangeTime && user.emailChangeTime < new Date()) ||
      (user && !user.emailChangeTime) ||
      (user && user.id !== userId) ||
      user.emailToChange
    )
      throw new BadRequestException(ERROR_MESSAGES.badKeyOrTime);

    await this.checkUniqueEmail({ email: dto.email, ...rest });

    user.emailToChange = dto.email;
    user.emailChangeKey = utils.common.getRandomId();
    user.emailChangeTime = utils.date.getDate(EMAIL_CHANGE_TIME, 'seconds');
    await user.save();

    await this.mailerService.sendMail({
      subject: MAIL_MESSAGES_OPTION.regiser.title,
      text: MAIL_MESSAGES_OPTION.regiser.message,
      code: user.emailChangeKey,
      email: user.emailToChange,
      ...rest,
    });

    return RESPONSE_MESSAGES.sendNewEmail;
  }

  async changeNickName({ nickName, userId, ...rest }: ChangeNickNameOptions) {
    const user = await this.usersDatabase.getByIdWithSettings(userId, rest);
    if (!user) throw new BadRequestException(ERROR_MESSAGES.userNotFound);
    if (user.nickNameChangeDate) {
      const lastDateChange = utils.date.getDate(
        NICK_NAME_CHANGE_TIMEOUT,
        'seconds',
        user.nickNameChangeDate,
      );
      if (lastDateChange > new Date())
        throw new BadRequestException(ERROR_MESSAGES.changedNickName);
    }
    await this.checkUniqueNickName({ nickName, ...rest });

    user.nickName = nickName;
    user.nickNameChangeDate = new Date();
    await user.save();
    return RESPONSE_MESSAGES.success;
  }

  async clearAvatar({ userId, ...rest }: ClearAvatarOptions) {
    const user = await this.usersDatabase.getById({ id: userId, ...rest });
    if (!user || !user.avatar)
      throw new BadRequestException(ERROR_MESSAGES.userNotFound);

    if (!(await this.usersDatabase.deleteFile(user.avatar, rest)))
      return new ConflictException("Couldn't clear avatar");

    user.avatar = null;
    await user.save();
    return RESPONSE_MESSAGES.success;
  }
  async updateAvatar({ incomingFile, userId, ...rest }: UpdateAvatarOptions) {
    const user = await this.usersDatabase.getById({ id: userId, ...rest });
    if (!user) throw new BadRequestException(ERROR_MESSAGES.userNotFound);

    if (user.avatar) this.usersDatabase.deleteFile(user.avatar, rest);
    if (
      !(await this.usersDatabase.saveFile(
        incomingFile.name,
        incomingFile.payload,
        rest,
      ))
    )
      return new ConflictException("Couldn't save avatar");

    user.avatar = incomingFile.name;
    await user.save();

    return RESPONSE_MESSAGES.success;
  }

  async clearWallpaper({ userId, ...rest }: ClearWallpaperOptions) {
    const user = await this.usersDatabase.getById({ id: userId, ...rest });
    if (!user || !user.wallpaper)
      throw new BadRequestException(ERROR_MESSAGES.userNotFound);

    if (!(await this.usersDatabase.deleteFile(user.wallpaper, rest)))
      return new ConflictException("Couldn't clear wallpaper");

    user.wallpaper = null;
    await user.save();
    return RESPONSE_MESSAGES.success;
  }
  async updateWallpaper({
    incomingFile,
    userId,
    ...rest
  }: UpdateWallpaperOptions) {
    const user = await this.usersDatabase.getById({ id: userId, ...rest });
    if (!user) throw new BadRequestException(ERROR_MESSAGES.userNotFound);

    if (user.wallpaper) this.usersDatabase.deleteFile(user.wallpaper, rest);
    if (
      !(await this.usersDatabase.saveFile(
        incomingFile.name,
        incomingFile.payload,
        rest,
      ))
    )
      return new ConflictException("Couldn't save wallpaper");

    user.wallpaper = incomingFile.name;
    await user.save();

    return RESPONSE_MESSAGES.success;
  }

  async createUser({ dto, ...rest }: CreateOptions) {
    const user = await this.usersDatabase.create(dto, rest);
    const settings = await this.settingService.settingsDatabase.create(
      dto.id,
      rest,
    );
    this.clientService.createStatistics({ userId: dto.id, ...rest });

    await Promise.all([user, settings]);
    return RESPONSE_MESSAGES.success;
  }
  async deleteAll({ dto, ...rest }: DeleteAllOptions) {
    this.clientService.deleteStatistics({ userIds: dto.ids, ...rest });
    this.clientService.deleteWords({ userIds: dto.ids, ...rest });
    await this.usersDatabase.deleteAll(dto, rest);

    return RESPONSE_MESSAGES.success;
  }
  async delete({ userId, ...rest }: DeleteOptions) {
    this.clientService.deleteStatistics({ userIds: [userId], ...rest });
    return this.usersDatabase.delete(userId, rest);
  }

  async checkUniqueEmail({ email, ...rest }: CheckUniqueEmailOptions) {
    const userByEmail = await this.usersDatabase.getByEmail(email, rest);
    if (userByEmail) {
      if (userByEmail.confirmed) {
        throw new BadRequestException(ERROR_MESSAGES.hasEmail);
      }
      await this.delete({ userId: userByEmail.id, ...rest });
    }
  }
  async checkUniqueNickName({ nickName, ...rest }: CheckUniqueNickNameOptions) {
    const userByNickName = await this.usersDatabase.getByNickName(
      nickName,
      rest,
    );
    if (userByNickName) {
      if (userByNickName.confirmed) {
        throw new BadRequestException(ERROR_MESSAGES.hasNickName);
      }
      await this.delete({ userId: userByNickName.id, ...rest });
    }
  }
}
