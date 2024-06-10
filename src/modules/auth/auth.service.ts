import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { v4 } from 'uuid';
import { utils } from '@krainovsd/utils';
import { compare, hash as getHash } from 'bcryptjs';
import { InjectJWT, JwtService } from '@krainovsd/nest-jwt-service';

import {
  ERROR_MESSAGES,
  MAIL_MESSAGES_OPTION,
  RESPONSE_MESSAGES,
  SALT_ROUNDS,
} from '@constants';

import {
  ConfirmOptions,
  LoginOptions,
  LogoutOptions,
  RegisterOptions,
  TokenOptions,
} from './auth.typings';
import { CreateUserDto, UsersService } from '../users';
import { MailerService } from '../mailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectJWT() private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly mailerService: MailerService,
  ) {}

  async register({ userDto, ...rest }: RegisterOptions) {
    await this.userService.checkUniqueEmail({ email: userDto.email, ...rest });
    await this.userService.checkUniqueNickName({
      nickName: userDto.nickName,
      ...rest,
    });
    const createUserDto = await this.getCreationUserInfo(userDto);
    await this.userService.createUser({ dto: createUserDto, ...rest });

    await this.mailerService.sendMail({
      subject: MAIL_MESSAGES_OPTION.regiser.title,
      text: MAIL_MESSAGES_OPTION.regiser.message,
      code: createUserDto.emailChangeKey,
      email: createUserDto.emailToChange,
      ...rest,
    });

    return RESPONSE_MESSAGES.sendEmail;
  }

  async confirm({ confirmDto, ...rest }: ConfirmOptions) {
    const user = await this.userService.getUserByEmailChangeKey({
      key: confirmDto.key,
      ...rest,
    });

    if (
      !user ||
      (user && user?.emailChangeTime && user.emailChangeTime < new Date()) ||
      !user?.emailToChange
    )
      throw new BadRequestException(ERROR_MESSAGES.badKeyOrTime);

    user.confirmed = true;
    user.email = user.emailToChange.toLowerCase();
    user.emailToChange = null;
    user.emailChangeDate = new Date();
    user.emailChangeKey = null;
    user.emailChangeTime = null;
    await user.save();
    return RESPONSE_MESSAGES.success;
  }

  async login({ loginDto, ...rest }: LoginOptions) {
    const user = await this.userService.getUserByEmailOrNickName({
      login: loginDto.login,
      ...rest,
    });
    if (!user) throw new BadRequestException(ERROR_MESSAGES.badLoginOrPassword);
    const checkPassword = await compare(loginDto.password, user.hash);
    if (!checkPassword)
      throw new BadRequestException(ERROR_MESSAGES.badLoginOrPassword);
    if (!user.confirmed)
      throw new BadRequestException(ERROR_MESSAGES.notConfirmed);

    user.token =
      user.token &&
      (await this.jwtService.verifyToken({
        token: user.token,
        type: 'refresh',
        ...rest,
      }))
        ? user.token
        : await this.jwtService.generateToken({
            user,
            type: 'refresh',
            ...rest,
          });
    const access = await this.jwtService.generateToken({
      user,
      type: 'access',
      ...rest,
    });
    user.lastLogin = new Date();
    await user.save();

    return { access, refresh: user.token };
  }

  async token({ refreshToken, ...rest }: TokenOptions) {
    const decodedToken = await this.jwtService.verifyToken({
      token: refreshToken,
      type: 'refresh',
      ...rest,
    });
    if (!decodedToken || !refreshToken) throw new UnauthorizedException();
    const user = await this.userService.getUserByTokenAndId({
      token: refreshToken,
      id: decodedToken.id,
      ...rest,
    });
    if (!user) throw new UnauthorizedException();
    const accessToken = await this.jwtService.generateToken({
      user,
      type: 'access',
      ...rest,
    });
    return { token: accessToken };
  }

  async logout({ refreshToken, userId, ...rest }: LogoutOptions) {
    if (!refreshToken) throw new UnauthorizedException();
    const user = await this.userService.getUserByTokenAndId({
      token: refreshToken,
      id: userId,
      ...rest,
    });
    if (!user) throw new UnauthorizedException();
    user.token = null;
    await user.save();
    return RESPONSE_MESSAGES.success;
  }

  private async getCreationUserInfo(userDto: CreateUserDto) {
    const hash = await getHash(userDto.password, SALT_ROUNDS);
    const registrationDate = new Date();
    const emailChangeTime = utils.date.getDate(1, 'years');
    const emailChangeKey = utils.common.getRandomId();
    return {
      id: v4(),
      userName: userDto.userName,
      nickName: userDto.nickName,
      hash,
      registrationDate,
      emailChangeKey,
      emailChangeTime,
      emailToChange: userDto.email.toLowerCase(),
    };
  }
}
