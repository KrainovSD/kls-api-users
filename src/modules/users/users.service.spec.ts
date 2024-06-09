import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { Provider } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { LOGGER_TOKEN } from '@krainovsd/nest-logger-service';
import { utils } from '@krainovsd/utils';

import { ClientService, SettingsService } from '@modules';
import { ERROR_MESSAGES } from '@constants';

import { UsersService } from './users.service';
import { User } from './users.model';
import { ChangePassDto, ChangeEmailDto } from './dto';

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
  const loggerProvider: Provider = {
    provide: LOGGER_TOKEN,
    useValue: {
      startRequest: jest.fn(() => null),
      endRequest: jest.fn(() => null),
      errorRequest: jest.fn(() => null),
      startWsMessage: jest.fn(() => null),
      endWsMessage: jest.fn(() => null),
      warnWsMessage: jest.fn(() => null),
      errorWsMessage: jest.fn(() => null),
      startEvent: jest.fn(() => null),
      endEvent: jest.fn(() => null),
      errorEvent: jest.fn(() => null),
      sendEvent: jest.fn(() => null),
      answerSuccess: jest.fn(() => null),
      answerError: jest.fn(() => null),
      info: jest.fn(() => null),
      error: jest.fn(() => null),
      warn: jest.fn(() => null),
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

  beforeEach(async () => {
    const userModuleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        repositoryProvider,
        mailerProvider,
        loggerProvider,
        clientProvider,
        settingsProvider,
      ],
    }).compile();

    usersService = userModuleRef.get<UsersService>(UsersService);
    usersModel = userModuleRef.get<typeof User>(getModelToken(User));
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
      jest.spyOn(usersModel, 'findOne').mockReturnValue({
        passwordChangeDate: utils.date.getDate(-2, 'hours'),
      } as any);
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
