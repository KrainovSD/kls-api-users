import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { utils } from '@krainovsd/utils';
import { hash as getHash } from 'bcryptjs';
import { InjectS3, S3Service } from '@krainovsd/nest-uploading-service';

import {
  ERROR_MESSAGES,
  MAIL_MESSAGES_OPTION,
  RESPONSE_MESSAGES,
  SALT_ROUNDS,
} from '@constants';
// import {
//   SettingsService,
//   Settings,
//   ClientService,
//   MailerService,
// } from '@modules';

import { User } from './users.model';
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
  CreateUserOptions,
  DeleteUserByIdOptions,
  DeleteUsersOptions,
  GetAllUserOptions,
  GetUserByEmailChangeKey,
  GetUserByEmailOptions,
  GetUserByEmailOrNickNameOptions,
  GetUserByIdOptions,
  GetUserByIdServiceOptions,
  GetUserByNickNameOptions,
  GetUserByPasswordChangeKeyOptions,
  GetUserByTokenAndIdOptions,
  UpdateAvatarOptions,
  UpdateWallpaperOptions,
} from './users.typings';
import { Settings } from '../settings/settings.model';
import { SettingsService } from '../settings/settings.service';

import { MailerService } from '../mailer';
import { ClientService } from '../clients';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private readonly userRepo: typeof User,
    private readonly settingService: SettingsService,
    private readonly mailerService: MailerService,
    private readonly clientService: ClientService,
    @InjectS3()
    private readonly s3Service: S3Service,
  ) {}

  private readonly forbiddenFields = [
    'hash',
    'confirmed',
    'token',
    'passwordChangeKey',
    'passwordChangeTime',
    'emailChangeKey',
    'emailChangeTime',
  ];
  private readonly privateFields = [
    'email',
    'passwordChangeDate',
    'emailChangeDate',
    'emailToChange',
    'nickNameChangeDate',
  ];

  async callChangePass({ email, userId, ...rest }: CallChangePassOptions) {
    const user = await this.getUserByEmail({ email, ...rest });
    if (!user) throw new BadRequestException(ERROR_MESSAGES.badEmail);

    if (user.passwordChangeDate) {
      const lastDateChange = user.passwordChangeDate;
      lastDateChange.setDate(lastDateChange.getDate() + 1);
      if (lastDateChange > new Date())
        throw new BadRequestException(ERROR_MESSAGES.oftenChangeData);
    }
    if (user.passwordChangeTime && user.passwordChangeTime > new Date())
      throw new BadRequestException(ERROR_MESSAGES.oftenTryChange);

    const passwordChangeKey = utils.common.getRandomId();
    const passwordChangeTime = new Date();
    passwordChangeTime.setMinutes(passwordChangeTime.getMinutes() + 5);
    user.passwordChangeKey = passwordChangeKey;
    user.passwordChangeTime = passwordChangeTime;
    await user.save();
    await this.mailerService.sendMail({
      subject: MAIL_MESSAGES_OPTION.changePassword.title,
      text: MAIL_MESSAGES_OPTION.changePassword.message,
      code: passwordChangeKey,
      email,
      ...rest,
    });

    return RESPONSE_MESSAGES.sendEmail;
  }
  async changePass({ userId, dto, ...rest }: ChangePassOptions) {
    const user = await this.getUserByPasswordChangeKey({
      key: dto.key,
      ...rest,
    });
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
    const user = await this.getUserByIdService({ id: userId, ...rest });

    if (!user || !user.email)
      throw new BadRequestException(ERROR_MESSAGES.userNotFound);

    if (user.emailChangeDate) {
      const lastDateChange = user.emailChangeDate;
      lastDateChange.setDate(lastDateChange.getDate() + 1);
      if (lastDateChange > new Date())
        throw new BadRequestException(ERROR_MESSAGES.oftenChangeData);
    }
    if (user.emailChangeTime && user.emailChangeTime > new Date())
      throw new BadRequestException(ERROR_MESSAGES.oftenTryChange);

    const emailChangeKey = utils.common.getRandomId();
    const emailChangeTime = new Date();
    emailChangeTime.setMinutes(emailChangeTime.getMinutes() + 5);
    user.emailChangeKey = emailChangeKey;
    user.emailChangeTime = emailChangeTime;
    await user.save();
    await this.mailerService.sendMail({
      subject: MAIL_MESSAGES_OPTION.callChangeEmail.title,
      text: MAIL_MESSAGES_OPTION.callChangeEmail.message,
      code: emailChangeKey,
      email: user.email,
      ...rest,
    });

    return RESPONSE_MESSAGES.sendEmail;
  }
  async changeEmail({ dto, userId, ...rest }: ChangeEmailOptions) {
    const user = await this.getUserByEmailChangeKey({ key: dto.key, ...rest });

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
    const emailChangeKey = utils.common.getRandomId();
    const emailChangeTime = new Date();
    emailChangeTime.setMinutes(emailChangeTime.getMinutes() + 5);
    user.emailChangeKey = emailChangeKey;
    user.emailChangeTime = emailChangeTime;
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
    const user = await this.getUserByIdService({ id: userId, ...rest });
    if (!user) throw new BadRequestException(ERROR_MESSAGES.userNotFound);
    if (user.nickNameChangeDate) {
      const lastDateChange = user.nickNameChangeDate;
      lastDateChange.setMonth(lastDateChange.getMonth() + 1);
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
    const user = await this.getUserById({ id: userId, ...rest });
    if (!user || !user.avatar)
      throw new BadRequestException(ERROR_MESSAGES.userNotFound);

    if (!(await this.s3Service.deleteItem({ key: user.avatar, ...rest })))
      return new ConflictException("Couldn't clear avatar");

    user.avatar = null;
    await user.save();
    return RESPONSE_MESSAGES.success;
  }
  async updateAvatar({ incomingFile, userId, ...rest }: UpdateAvatarOptions) {
    const user = await this.getUserById({ id: userId, ...rest });
    if (!user) throw new BadRequestException(ERROR_MESSAGES.userNotFound);

    if (user.avatar) this.s3Service.deleteItem({ key: user.avatar, ...rest });
    if (
      !(await this.s3Service.putItem({
        key: incomingFile.name,
        payload: incomingFile.payload,
        ...rest,
      }))
    )
      return new ConflictException("Couldn't save avatar");

    user.avatar = incomingFile.name;
    await user.save();

    return RESPONSE_MESSAGES.success;
  }

  async clearWallpaper({ userId, ...rest }: ClearWallpaperOptions) {
    const user = await this.getUserById({ id: userId, ...rest });
    if (!user || !user.wallpaper)
      throw new BadRequestException(ERROR_MESSAGES.userNotFound);

    if (!(await this.s3Service.deleteItem({ key: user.wallpaper, ...rest })))
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
    const user = await this.getUserById({ id: userId, ...rest });
    if (!user) throw new BadRequestException(ERROR_MESSAGES.userNotFound);

    if (user.wallpaper)
      this.s3Service.deleteItem({ key: user.wallpaper, ...rest });
    if (
      !(await this.s3Service.putItem({
        key: incomingFile.name,
        payload: incomingFile.payload,
        ...rest,
      }))
    )
      return new ConflictException("Couldn't save wallpaper");

    user.wallpaper = incomingFile.name;
    await user.save();

    return RESPONSE_MESSAGES.success;
  }

  async createUser({ dto, ...rest }: CreateUserOptions) {
    const user = this.userRepo.create(dto);
    const settings = this.settingService.createSettings(dto.id);
    this.clientService.createStatistics({ userId: dto.id, ...rest });

    await Promise.all([user, settings]);
    return RESPONSE_MESSAGES.success;
  }

  async deleteUsers({ dto, ...rest }: DeleteUsersOptions) {
    this.clientService.deleteStatistics({ userIds: dto.ids, ...rest });
    this.clientService.deleteWords({ userIds: dto.ids, ...rest });
    await this.userRepo.destroy({
      where: {
        id: dto.ids,
      },
    });

    return RESPONSE_MESSAGES.success;
  }

  async getUserByEmail({ email }: GetUserByEmailOptions) {
    return this.userRepo.findOne({ where: { email } });
  }
  async getUserByNickName({ nickName }: GetUserByNickNameOptions) {
    return this.userRepo.findOne({ where: { nickName } });
  }
  async getUserByIdService({ id }: GetUserByIdServiceOptions) {
    return this.userRepo.findByPk(id, {
      include: [Settings],
    });
  }
  async getUserById({ id, privateFields = false }: GetUserByIdOptions) {
    return this.userRepo.findByPk(id, {
      attributes: {
        exclude: privateFields
          ? this.forbiddenFields
          : [...this.forbiddenFields, ...this.privateFields],
      },
      include: [Settings],
    });
  }
  async getAllUser({ userId }: GetAllUserOptions) {
    return this.userRepo.findAll({
      where: {
        id: {
          [Op.not]: userId,
        },
      },
      attributes: {
        exclude: [...this.forbiddenFields, ...this.privateFields],
      },
    });
  }
  async getUserByEmailChangeKey({ key }: GetUserByEmailChangeKey) {
    return this.userRepo.findOne({ where: { emailChangeKey: key } });
  }
  async getUserByPasswordChangeKey({ key }: GetUserByPasswordChangeKeyOptions) {
    return this.userRepo.findOne({
      where: { passwordChangeKey: key },
    });
  }
  async getUserByEmailOrNickName({ login }: GetUserByEmailOrNickNameOptions) {
    return this.userRepo.findOne({
      where: {
        [Op.or]: [
          {
            email: login.toLowerCase(),
          },
          {
            nickName: login,
          },
        ],
      },
    });
  }
  async getUserByTokenAndId({ id, token }: GetUserByTokenAndIdOptions) {
    return this.userRepo.findOne({
      where: {
        [Op.and]: [{ token }, { id }],
      },
    });
  }
  async deleteUserById({ id, ...rest }: DeleteUserByIdOptions) {
    this.clientService.deleteStatistics({ userIds: [id], ...rest });
    return this.userRepo.destroy({ where: { id } });
  }

  async checkUniqueEmail({ email, ...rest }: CheckUniqueEmailOptions) {
    const userByEmail = await this.getUserByEmail({ email, ...rest });
    if (userByEmail) {
      if (userByEmail.confirmed) {
        throw new BadRequestException(ERROR_MESSAGES.hasEmail);
      }
      await this.deleteUserById({ id: userByEmail.id, ...rest });
    }
  }
  async checkUniqueNickName({ nickName, ...rest }: CheckUniqueNickNameOptions) {
    const userByNickName = await this.getUserByNickName({ nickName, ...rest });
    if (userByNickName) {
      if (userByNickName.confirmed) {
        throw new BadRequestException(ERROR_MESSAGES.hasNickName);
      }
      await this.deleteUserById({ id: userByNickName.id, ...rest });
    }
  }
}
