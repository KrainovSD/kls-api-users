import { Test } from '@nestjs/testing';
import { Provider, UnauthorizedException } from '@nestjs/common';
import { JWT_TOKEN, JwtModule, JwtService } from '@krainovsd/nest-jwt-service';
import { utils } from '@krainovsd/utils';
import { hash as getHash } from 'bcryptjs';

import {
  ACCESS_TOKEN_SECRET,
  EXPIRES_ACCESS_TOKEN,
  EXPIRES_REFRESH_TOKEN,
  REFRESH_TOKEN_SECRET,
} from '@config';
import { ERROR_MESSAGES, RESPONSE_MESSAGES, SALT_ROUNDS } from '@constants';
import { User } from '@database';

import { AuthService } from './auth.service';
import { ConfirmDto, LoginDto } from './dto';
import { UsersService } from '../users';
import { MailerService } from '../mailer';

describe('Auth Service', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  const operationId = '012345678';
  const user = { id: '1', role: 'admin', subscription: null };

  const mailerProvider: Provider = {
    provide: MailerService,
    useValue: {
      sendMail: jest.fn(() => null),
    },
  };
  const userProvider: Provider = {
    provide: UsersService,
    useValue: {
      checkUniqueEmail: jest.fn(() => null),
      checkUniqueNickName: jest.fn(() => null),
      createUser: jest.fn(() => null),
      getUserByEmailChangeKey: jest.fn(() => null),
      getUserByEmailOrNickName: jest.fn(() => null),
      getUserByTokenAndId: jest.fn(() => null),
    },
  };

  beforeAll(async () => {
    const authModuleRef = await Test.createTestingModule({
      imports: [
        JwtModule.forRoot({
          accessTokenSecret: ACCESS_TOKEN_SECRET,
          refreshTokenSecret: REFRESH_TOKEN_SECRET,
          expiresAccessToken: EXPIRES_ACCESS_TOKEN,
          expiresRefreshToken: EXPIRES_REFRESH_TOKEN,
        }),
      ],
      providers: [AuthService, mailerProvider, userProvider],
    }).compile();

    authService = authModuleRef.get<AuthService>(AuthService);
    usersService = authModuleRef.get<UsersService>(UsersService);
    jwtService = authModuleRef.get<JwtService>(JWT_TOKEN);
  });

  describe('confirm', () => {
    const confirmDto: ConfirmDto = { key: '0' };

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('bad key - error', async () => {
      jest
        .spyOn(usersService, 'getUserByEmailChangeKey')
        .mockImplementation(async () => null);
      await expect(
        authService.confirm({ confirmDto, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime.message);
    });
    it('email change time has expired - error', async () => {
      jest.spyOn(usersService, 'getUserByEmailChangeKey').mockImplementation(
        async () =>
          ({
            emailChangeTime: utils.date.getDate(-1, 'minutes'),
          }) as User,
      );
      await expect(
        authService.confirm({ confirmDto, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime.message);
    });
    it(`haven't email to change - error`, async () => {
      jest.spyOn(usersService, 'getUserByEmailChangeKey').mockImplementation(
        async () =>
          ({
            emailChangeTime: utils.date.getDate(2, 'minutes'),
          }) as User,
      );
      await expect(
        authService.confirm({ confirmDto, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime.message);
    });
    it(`success`, async () => {
      jest.spyOn(usersService, 'getUserByEmailChangeKey').mockImplementation(
        async () =>
          ({
            emailChangeTime: utils.date.getDate(2, 'minutes'),
            emailToChange: 'test@gmail.com',
            save: () => null,
          }) as unknown as User,
      );
      await expect(
        authService.confirm({ confirmDto, operationId }),
      ).resolves.toBeTruthy();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = { login: 'login', password: '123456' };

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("haven't user - error", async () => {
      jest
        .spyOn(usersService, 'getUserByEmailOrNickName')
        .mockImplementation(async () => null);

      await expect(
        authService.login({ loginDto, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badLoginOrPassword.message);
    });

    it('bad password - error', async () => {
      const hash = await getHash(
        loginDto.password.substring(0, loginDto.password.length - 2),
        SALT_ROUNDS,
      );

      jest.spyOn(usersService, 'getUserByEmailOrNickName').mockImplementation(
        async () =>
          ({
            confirmed: true,
            hash,
          }) as User,
      );

      await expect(
        authService.login({ loginDto, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badLoginOrPassword.message);
    });

    it('not confirmed - error', async () => {
      const hash = await getHash(loginDto.password, SALT_ROUNDS);

      jest.spyOn(usersService, 'getUserByEmailOrNickName').mockImplementation(
        async () =>
          ({
            confirmed: false,
            hash,
          }) as User,
      );

      await expect(
        authService.login({ loginDto, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.notConfirmed.message);
    });

    it('success', async () => {
      const hash = await getHash(loginDto.password, SALT_ROUNDS);
      const token = await jwtService.generateToken({
        type: 'refresh',
        user,
      });

      jest.spyOn(usersService, 'getUserByEmailOrNickName').mockImplementation(
        async () =>
          ({
            confirmed: true,
            hash,
            token,
            save: () => null,
          }) as unknown as User,
      );

      const result = await authService.login({ loginDto, operationId });

      expect(result.refresh).toBe(token);
    });
  });

  describe('token', () => {
    let refreshToken: string;

    beforeAll(async () => {
      refreshToken = await jwtService.generateToken({
        type: 'refresh',
        user,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('bad token', async () => {
      await expect(
        authService.token({ operationId, refreshToken: '123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('not found user', async () => {
      jest
        .spyOn(usersService, 'getUserByTokenAndId')
        .mockImplementation(async () => null);

      await expect(
        authService.token({ operationId, refreshToken }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('success', async () => {
      jest
        .spyOn(usersService, 'getUserByTokenAndId')
        .mockImplementation(async () => ({}) as User);

      await expect(
        authService.token({ operationId, refreshToken }),
      ).resolves.toBeInstanceOf(Object);
    });
  });

  describe('logout', () => {
    let refreshToken: string;

    beforeAll(async () => {
      refreshToken = await jwtService.generateToken({
        type: 'refresh',
        user,
      });
    });
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('bad token', async () => {
      await expect(
        authService.logout({
          operationId,
          refreshToken: undefined,
          userId: user.id,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('bad id', async () => {
      jest
        .spyOn(usersService, 'getUserByTokenAndId')
        .mockImplementation(async () => null);

      await expect(
        authService.logout({
          operationId,
          refreshToken,
          userId: user.id,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('success', async () => {
      jest
        .spyOn(usersService, 'getUserByTokenAndId')
        .mockImplementation(
          async () => ({ save: () => null }) as unknown as User,
        );

      await expect(
        authService.logout({
          operationId,
          refreshToken,
          userId: user.id,
        }),
      ).resolves.toEqual(RESPONSE_MESSAGES.success);
    });
  });
});
