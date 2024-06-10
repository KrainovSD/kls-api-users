import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { Provider } from '@nestjs/common';
import { utils } from '@krainovsd/utils';
import { S3_TOKEN } from '@krainovsd/nest-uploading-service';

import { ERROR_MESSAGES } from '@constants';
import { User } from '@database';

import { UsersService } from './users.service';
import { ChangePassDto, ChangeEmailDto } from './dto';
import { ClientService } from '../clients';
import { SettingsService } from '../settings';
import { MailerService } from '../mailer';
import { UsersDatabase } from './users.database';

describe('Users Service', () => {
  let usersService: UsersService;
  let usersModel: typeof User;

  const repositoryProvider: Provider = {
    provide: getModelToken(User),
    useValue: {
      create: jest.fn(() => null),
      findOne: jest.fn(() => null),
      destroy: jest.fn(() => null),
      findByPk: jest.fn(() => null),
      findAll: jest.fn(() => null),
    },
  };
  const mailerProvider: Provider = {
    provide: MailerService,
    useValue: {
      sendMail: jest.fn(() => null),
    },
  };
  const clientProvider: Provider = {
    provide: ClientService,
    useValue: {
      deleteStatistics: jest.fn(() => null),
    },
  };
  const settingsProvider: Provider = {
    provide: SettingsService,
    useValue: {
      createSettings: jest.fn(() => null),
    },
  };
  const s3Provider: Provider = {
    provide: S3_TOKEN,
    useValue: {
      createSettings: jest.fn(() => null),
    },
  };

  beforeEach(async () => {
    const userModuleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        UsersDatabase,
        repositoryProvider,
        mailerProvider,
        clientProvider,
        settingsProvider,
        s3Provider,
      ],
    }).compile();

    usersService = userModuleRef.get<UsersService>(UsersService);
    usersModel = userModuleRef.get<typeof User>(getModelToken(User));

    console.log(usersService.usersDatabase);
    console.log(usersService);
  });

  describe('callChangePass', () => {
    let email: string;
    let userId: string;
    let operationId: string;

    beforeEach(() => {
      email = 'test';
      userId = '0';
      operationId = '0';
    });

    it('bad email', async () => {
      await expect(
        usersService.callChangePass({ email, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badEmail.message);
    });
    it('repeated actions within 24hours', async () => {
      jest.spyOn(usersModel, 'findOne').mockImplementation(
        async () =>
          ({
            passwordChangeDate: utils.date.getDate(-2, 'hours'),
          }) as User,
      );
      await expect(
        usersService.callChangePass({ email, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.oftenChangeData.message);
    });
    it('repeated actions until the end previous', async () => {
      jest.spyOn(usersModel, 'findOne').mockReturnValue({
        passwordChangeDate: utils.date.getDate(-1, 'days'),
        passwordChangeTime: utils.date.getDate(5, 'minutes'),
      } as any);
      await expect(
        usersService.callChangePass({ email, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.oftenTryChange.message);
    });
    it('success', async () => {
      jest.spyOn(usersModel, 'findOne').mockReturnValue({
        passwordChangeDate: utils.date.getDate(-1, 'days'),
        passwordChangeTime: utils.date.getDate(-5, 'minutes'),
        save: () => null,
      } as any);
      await expect(
        usersService.callChangePass({ email, userId, operationId }),
      ).resolves.toBeTruthy();
      jest.spyOn(usersModel, 'findOne').mockReturnValue({
        passwordChangeDate: utils.date.getDate(-1, 'days'),
        passwordChangeTime: null,
        save: () => null,
      } as any);
      await expect(
        usersService.callChangePass({ email, userId, operationId }),
      ).resolves.toBeTruthy();
    });
  });
  describe('changePass', () => {
    let dto: ChangePassDto;
    let userId: string;
    let operationId: string;

    beforeEach(() => {
      dto = { key: '0', password: '0' };
      userId = '0';
      operationId = '0';
    });

    it(`couldn't found user`, async () => {
      jest.spyOn(usersModel, 'findOne').mockImplementation(async () => null);
      await expect(
        usersService.changePass({ dto, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime.message);
    });
    it(`user haven't change time`, async () => {
      jest.spyOn(usersModel, 'findOne').mockReturnValue({
        passwordChangeTime: null,
      } as any);
      await expect(
        usersService.changePass({ dto, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime.message);
    });
    it(`user's change time has expired`, async () => {
      jest.spyOn(usersModel, 'findOne').mockReturnValue({
        passwordChangeTime: utils.date.getDate(-1, 'minutes'),
      } as any);
      await expect(
        usersService.changePass({ dto, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime.message);
    });
    it(`success`, async () => {
      jest.spyOn(usersModel, 'findOne').mockReturnValue({
        passwordChangeTime: utils.date.getDate(1, 'minutes'),
        save: () => null,
      } as any);
      await expect(
        usersService.changePass({ dto, userId, operationId }),
      ).resolves.toBeTruthy();
    });
  });
  describe('callChangeEmail', () => {
    let userId: string;
    let operationId: string;

    beforeEach(() => {
      userId = '0';
      operationId = '0';
    });

    it('bad userId', async () => {
      await expect(
        usersService.callChangeEmail({ userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.userNotFound.message);
    });
    it('repeated actions within 24hours', async () => {
      jest.spyOn(usersModel, 'findByPk').mockReturnValue({
        emailChangeDate: utils.date.getDate(-2, 'hours'),
      } as any);
      await expect(
        usersService.callChangeEmail({ userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.oftenChangeData.message);
    });
    it('repeated actions until the end previous', async () => {
      jest.spyOn(usersModel, 'findByPk').mockReturnValue({
        emailChangeDate: utils.date.getDate(-1, 'days'),
        emailChangeTime: utils.date.getDate(5, 'minutes'),
      } as any);
      await expect(
        usersService.callChangeEmail({ userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.oftenTryChange.message);
    });
    it('success', async () => {
      jest.spyOn(usersModel, 'findByPk').mockReturnValue({
        emailChangeDate: utils.date.getDate(-25, 'hours'),
        emailChangeTime: utils.date.getDate(-5, 'minutes'),
        save: () => null,
      } as any);
      await expect(
        usersService.callChangeEmail({ userId, operationId }),
      ).resolves.toBeTruthy();
      jest.spyOn(usersModel, 'findByPk').mockReturnValue({
        emailChangeDate: utils.date.getDate(-25, 'hours'),
        emailChangeTime: null,
        save: () => null,
      } as any);
      await expect(
        usersService.callChangeEmail({ userId, operationId }),
      ).resolves.toBeTruthy();
    });
  });
  describe('changeEmail', () => {
    let dto: ChangeEmailDto;
    let userId: string;
    let operationId: string;

    beforeEach(() => {
      dto = { key: '0', email: 'test@gmail.com' };
      userId = '0';
      operationId = '0';
    });

    it(`couldn't found user`, async () => {
      jest.spyOn(usersModel, 'findOne').mockReturnValue(null as any);
      await expect(
        usersService.changeEmail({ dto, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime.message);
    });
    it(`user haven't change time`, async () => {
      jest.spyOn(usersModel, 'findOne').mockReturnValue({
        emailChangeTime: null,
      } as any);
      await expect(
        usersService.changeEmail({ dto, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime.message);
    });
    it(`user's change time has expired`, async () => {
      jest.spyOn(usersModel, 'findOne').mockReturnValue({
        emailChangeTime: utils.date.getDate(-1, 'minutes'),
      } as any);
      await expect(
        usersService.changeEmail({ dto, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime.message);
    });
    it(`not compared userId`, async () => {
      jest.spyOn(usersModel, 'findOne').mockReturnValue({
        emailChangeTime: utils.date.getDate(1, 'minutes'),
        id: '1',
      } as any);
      await expect(
        usersService.changeEmail({ dto, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime.message);
    });
    it(`success`, async () => {
      jest.spyOn(usersModel, 'findOne').mockReturnValueOnce({
        emailChangeTime: utils.date.getDate(1, 'minutes'),
        id: '0',
        save: () => null,
      } as any);
      await expect(
        usersService.changeEmail({ dto, userId, operationId }),
      ).resolves.toBeTruthy();
    });
  });
});
