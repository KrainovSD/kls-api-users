import { Test } from '@nestjs/testing';
import { Provider } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtModule } from '@krainovsd/nest-jwt-service';
import { utils } from '@krainovsd/utils';

import { ERROR_MESSAGES } from '../../const';
import { AuthService } from './auth.service';
import { ConfirmDto } from './dto';
import { UsersService } from '../users';
import { User } from '../users/users.model';
import {
  ACCESS_TOKEN_SECRET,
  EXPIRES_ACCESS_TOKEN,
  EXPIRES_REFRESH_TOKEN,
  REFRESH_TOKEN_SECRET,
} from '../../config';

describe('Auth Service', () => {
  let authService: AuthService;
  let usersService: UsersService;

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

  beforeEach(async () => {
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
  });

  describe('confirm', () => {
    let confirmDto: ConfirmDto;
    let traceId: string;
    let operationId: string;

    beforeAll(() => {
      confirmDto = { key: '0' };
      traceId = '0';
      operationId = '0';
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('bad key', async () => {
      jest
        .spyOn(usersService, 'getUserByEmailChangeKey')
        .mockImplementation(async () => null);
      await expect(
        authService.confirm({ confirmDto, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime);
    });
    it('email change time has expired', async () => {
      jest.spyOn(usersService, 'getUserByEmailChangeKey').mockImplementation(
        async () =>
          ({
            emailChangeTime: utils.date.getDate(-1, 'minutes'),
          }) as User,
      );
      await expect(
        authService.confirm({ confirmDto, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime);
    });
    it(`haven't email to change`, async () => {
      jest.spyOn(usersService, 'getUserByEmailChangeKey').mockImplementation(
        async () =>
          ({
            emailChangeTime: utils.date.getDate(2, 'minutes'),
          }) as User,
      );
      await expect(
        authService.confirm({ confirmDto, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime);
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
});
