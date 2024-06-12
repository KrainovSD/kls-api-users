import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { Provider } from '@nestjs/common';
import { utils } from '@krainovsd/utils';
import { S3_TOKEN } from '@krainovsd/nest-uploading-service';

import {
  DATA_CHANGE_TIMEOUT,
  EMAIL_CHANGE_TIME,
  ERROR_MESSAGES,
  NICK_NAME_CHANGE_TIMEOUT,
  PASSWORD_CHANGE_TIME,
} from '@constants';
import { User } from '@database';

import { UsersService } from './users.service';
import { ChangePassDto, ChangeEmailDto } from './dto';
import { ClientService } from '../clients';
import { SettingsService } from '../settings';
import { MailerService } from '../mailer';
import { UsersDatabase } from './users.database';

describe('Users Service', () => {
  let usersService: UsersService;

  beforeAll(async () => {
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
      useValue: {},
    };

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
  });

  describe('callChangePass', () => {
    const email = 'test';
    const userId = '1';
    const operationId = '1';

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('not found users', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByEmail')
        .mockImplementation(async () => null);

      await expect(
        usersService.callChangePass({ email, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badEmail.message);
    });
    it('often change', async () => {
      jest.spyOn(usersService.usersDatabase, 'getByEmail').mockImplementation(
        async () =>
          ({
            passwordChangeDate: utils.date.getDate(
              -DATA_CHANGE_TIMEOUT + 60,
              'seconds',
            ),
          }) as User,
      );
      await expect(
        usersService.callChangePass({ email, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.oftenChangeData.message);
    });
    it('often try call', async () => {
      jest.spyOn(usersService.usersDatabase, 'getByEmail').mockImplementation(
        async () =>
          ({
            passwordChangeDate: utils.date.getDate(
              -DATA_CHANGE_TIMEOUT - 60,
              'seconds',
            ),
            passwordChangeTime: utils.date.getDate(
              PASSWORD_CHANGE_TIME,
              'seconds',
            ),
          }) as User,
      );
      await expect(
        usersService.callChangePass({ email, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.oftenTryChange.message);
    });
    it('success', async () => {
      jest.spyOn(usersService.usersDatabase, 'getByEmail').mockImplementation(
        async () =>
          ({
            passwordChangeDate: utils.date.getDate(
              -DATA_CHANGE_TIMEOUT - 60,
              'seconds',
            ),
            save: () => null,
          }) as unknown as User,
      );

      await expect(
        usersService.callChangePass({ email, userId, operationId }),
      ).resolves.toBeInstanceOf(Object);
    });
  });
  describe('changePass', () => {
    const dto: ChangePassDto = { key: '0', password: '0' };
    const userId = '1';
    const operationId = '1';

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('not found user', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByPasswordChangeKey')
        .mockImplementation(async () => null);

      await expect(
        usersService.changePass({ dto, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime.message);
    });

    it('bad time', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByPasswordChangeKey')
        .mockImplementation(
          async () =>
            ({
              passwordChangeTime: utils.date.getDate(-1, 'minutes'),
            }) as User,
        );

      await expect(
        usersService.changePass({ dto, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime.message);
    });

    it('not found time', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByPasswordChangeKey')
        .mockImplementation(
          async () =>
            ({
              passwordChangeTime: null,
            }) as User,
        );

      await expect(
        usersService.changePass({ dto, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime.message);
    });

    it('success', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByPasswordChangeKey')
        .mockImplementation(
          async () =>
            ({
              passwordChangeTime: utils.date.getDate(
                PASSWORD_CHANGE_TIME,
                'seconds',
              ),
              save: () => null,
            }) as unknown as User,
        );

      await expect(
        usersService.changePass({ dto, userId, operationId }),
      ).resolves.toBeInstanceOf(Object);
    });
  });
  describe('callChangeEmail', () => {
    const userId = '1';
    const operationId = '1';

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('not found users', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByIdWithSettings')
        .mockImplementation(async () => null);

      await expect(
        usersService.callChangeEmail({ userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.userNotFound.message);
    });
    it('often change', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByIdWithSettings')
        .mockImplementation(
          async () =>
            ({
              email: 'test',
              emailChangeDate: utils.date.getDate(
                -DATA_CHANGE_TIMEOUT + 60,
                'seconds',
              ),
            }) as User,
        );
      await expect(
        usersService.callChangeEmail({ userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.oftenChangeData.message);
    });
    it('often try call', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByIdWithSettings')
        .mockImplementation(
          async () =>
            ({
              email: 'test',
              emailChangeDate: utils.date.getDate(
                -DATA_CHANGE_TIMEOUT - 60,
                'seconds',
              ),
              emailChangeTime: utils.date.getDate(EMAIL_CHANGE_TIME, 'seconds'),
            }) as User,
        );
      await expect(
        usersService.callChangeEmail({ userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.oftenTryChange.message);
    });
    it('success', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByIdWithSettings')
        .mockImplementation(
          async () =>
            ({
              email: 'test',
              emailChangeDate: utils.date.getDate(
                -DATA_CHANGE_TIMEOUT - 60,
                'seconds',
              ),
              save: () => null,
            }) as unknown as User,
        );

      await expect(
        usersService.callChangeEmail({ userId, operationId }),
      ).resolves.toBeInstanceOf(Object);
    });
  });
  describe('changeEmail', () => {
    const dto: ChangeEmailDto = { key: '0', email: 'test' };
    const userId = '1';
    const operationId = '1';

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('not found user', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByEmailChangeKey')
        .mockImplementation(async () => null);

      await expect(
        usersService.changeEmail({ dto, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime.message);
    });

    it('bad time', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByEmailChangeKey')
        .mockImplementation(
          async () =>
            ({
              emailChangeTime: utils.date.getDate(-1, 'minutes'),
            }) as User,
        );

      await expect(
        usersService.changeEmail({ dto, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime.message);
    });

    it('not found time', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByEmailChangeKey')
        .mockImplementation(
          async () =>
            ({
              emailChangeTime: null,
            }) as User,
        );

      await expect(
        usersService.changeEmail({ dto, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime.message);
    });

    it('bad user id', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByEmailChangeKey')
        .mockImplementation(
          async () =>
            ({
              id: `${userId}0`,
              emailChangeTime: utils.date.getDate(EMAIL_CHANGE_TIME, 'seconds'),
            }) as unknown as User,
        );

      await expect(
        usersService.changeEmail({ dto, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime.message);
    });

    it('has email to change', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByEmailChangeKey')
        .mockImplementation(
          async () =>
            ({
              id: userId,
              emailChangeTime: utils.date.getDate(EMAIL_CHANGE_TIME, 'seconds'),
              emailToChange: 'test',
            }) as unknown as User,
        );

      await expect(
        usersService.changeEmail({ dto, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime.message);
    });

    it('success', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByEmailChangeKey')
        .mockImplementation(
          async () =>
            ({
              id: userId,
              emailChangeTime: utils.date.getDate(EMAIL_CHANGE_TIME, 'seconds'),
              save: () => null,
            }) as unknown as User,
        );

      await expect(
        usersService.changeEmail({ dto, userId, operationId }),
      ).resolves.toBeInstanceOf(Object);
    });
  });
  describe('changeNickName', () => {
    const nickName = 'test';
    const userId = '1';
    const operationId = '1';

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('not found users', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByIdWithSettings')
        .mockImplementation(async () => null);

      await expect(
        usersService.changeNickName({ nickName, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.userNotFound.message);
    });
    it('often change', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByIdWithSettings')
        .mockImplementation(
          async () =>
            ({
              nickNameChangeDate: utils.date.getDate(
                -NICK_NAME_CHANGE_TIMEOUT + 60,
                'seconds',
              ),
            }) as User,
        );
      await expect(
        usersService.changeNickName({ nickName, userId, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.changedNickName.message);
    });
    it('success', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByIdWithSettings')
        .mockImplementation(
          async () =>
            ({
              nickNameChangeDate: utils.date.getDate(
                -NICK_NAME_CHANGE_TIMEOUT - 60,
                'seconds',
              ),
              save: () => null,
            }) as unknown as User,
        );
      jest
        .spyOn(usersService, 'checkUniqueNickName')
        .mockImplementation(async () => {});
      await expect(
        usersService.changeNickName({ nickName, userId, operationId }),
      ).resolves.toBeInstanceOf(Object);
    });
  });
  describe('clearAvatar', () => {
    const userId = '1';
    const operationId = '1';

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('user not found', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getById')
        .mockImplementation(async () => null);

      await expect(
        usersService.clearAvatar({ operationId, userId }),
      ).rejects.toThrowError(ERROR_MESSAGES.userNotFound.message);
    });

    it('avatar not found', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getById')
        .mockImplementation(async () => ({}) as User);

      await expect(
        usersService.clearAvatar({ operationId, userId }),
      ).rejects.toThrowError(ERROR_MESSAGES.userNotFound.message);
    });

    it("couldn't delete", async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getById')
        .mockImplementation(async () => ({ avatar: 'string' }) as User);
      jest
        .spyOn(usersService.usersDatabase, 'deleteFile')
        .mockImplementation(async () => false);

      await expect(
        usersService.clearAvatar({ operationId, userId }),
      ).rejects.toThrowError(ERROR_MESSAGES.conflictOperation.message);
    });

    it('success', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getById')
        .mockImplementation(
          async () =>
            ({ avatar: 'string', save: () => null }) as unknown as User,
        );
      jest
        .spyOn(usersService.usersDatabase, 'deleteFile')
        .mockImplementation(async () => true);

      await expect(
        usersService.clearAvatar({ operationId, userId }),
      ).resolves.toBeInstanceOf(Object);
    });
  });
  describe('updateAvatar', () => {
    const incomingFile: IncomingFile = {
      name: 'file',
      payload: Buffer.from([]),
    };
    const userId = '1';
    const operationId = '1';

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('user not found', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getById')
        .mockImplementation(async () => null);

      await expect(
        usersService.updateAvatar({ operationId, incomingFile, userId }),
      ).rejects.toThrowError(ERROR_MESSAGES.userNotFound.message);
    });

    it("couldn't save", async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getById')
        .mockImplementation(async () => ({}) as User);
      jest
        .spyOn(usersService.usersDatabase, 'saveFile')
        .mockImplementation(async () => false);
      await expect(
        usersService.updateAvatar({ operationId, incomingFile, userId }),
      ).rejects.toThrowError(ERROR_MESSAGES.conflictOperation.message);
    });
    it('success and deleted old', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getById')
        .mockImplementation(
          async () =>
            ({ avatar: 'string', save: () => null }) as unknown as User,
        );
      jest
        .spyOn(usersService.usersDatabase, 'saveFile')
        .mockImplementation(async () => true);
      const deleteMock = jest
        .spyOn(usersService.usersDatabase, 'deleteFile')
        .mockImplementation(async () => true);

      const response = await usersService.updateAvatar({
        operationId,
        incomingFile,
        userId,
      });

      expect(response).toBeInstanceOf(Object);
      expect(deleteMock).toBeCalled();
    });
  });
  describe('clearWallpaper', () => {
    const userId = '1';
    const operationId = '1';

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('user not found', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getById')
        .mockImplementation(async () => null);

      await expect(
        usersService.clearWallpaper({ operationId, userId }),
      ).rejects.toThrowError(ERROR_MESSAGES.userNotFound.message);
    });

    it('avatar not found', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getById')
        .mockImplementation(async () => ({}) as User);

      await expect(
        usersService.clearWallpaper({ operationId, userId }),
      ).rejects.toThrowError(ERROR_MESSAGES.userNotFound.message);
    });

    it("couldn't delete", async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getById')
        .mockImplementation(async () => ({ wallpaper: 'string' }) as User);
      jest
        .spyOn(usersService.usersDatabase, 'deleteFile')
        .mockImplementation(async () => false);

      await expect(
        usersService.clearWallpaper({ operationId, userId }),
      ).rejects.toThrowError(ERROR_MESSAGES.conflictOperation.message);
    });

    it('success', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getById')
        .mockImplementation(
          async () =>
            ({ wallpaper: 'string', save: () => null }) as unknown as User,
        );
      jest
        .spyOn(usersService.usersDatabase, 'deleteFile')
        .mockImplementation(async () => true);

      await expect(
        usersService.clearWallpaper({ operationId, userId }),
      ).resolves.toBeInstanceOf(Object);
    });
  });
  describe('updateWallpaper', () => {
    const incomingFile: IncomingFile = {
      name: 'file',
      payload: Buffer.from([]),
    };
    const userId = '1';
    const operationId = '1';

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('user not found', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getById')
        .mockImplementation(async () => null);

      await expect(
        usersService.updateWallpaper({ operationId, incomingFile, userId }),
      ).rejects.toThrowError(ERROR_MESSAGES.userNotFound.message);
    });

    it("couldn't save", async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getById')
        .mockImplementation(async () => ({}) as User);
      jest
        .spyOn(usersService.usersDatabase, 'saveFile')
        .mockImplementation(async () => false);
      await expect(
        usersService.updateWallpaper({ operationId, incomingFile, userId }),
      ).rejects.toThrowError(ERROR_MESSAGES.conflictOperation.message);
    });
    it('success and deleted old', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getById')
        .mockImplementation(
          async () =>
            ({ wallpaper: 'string', save: () => null }) as unknown as User,
        );
      jest
        .spyOn(usersService.usersDatabase, 'saveFile')
        .mockImplementation(async () => true);
      const deleteMock = jest
        .spyOn(usersService.usersDatabase, 'deleteFile')
        .mockImplementation(async () => true);

      const response = await usersService.updateWallpaper({
        operationId,
        incomingFile,
        userId,
      });

      expect(response).toBeInstanceOf(Object);
      expect(deleteMock).toBeCalled();
    });
  });
  describe('checkUniqueEmail', () => {
    const email = 'email';
    const operationId = '2';

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('not found user', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByEmail')
        .mockImplementation(async () => null);

      await expect(
        usersService.checkUniqueEmail({ email, operationId }),
      ).resolves.toBeUndefined();
    });

    it('find user but not confirmed', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByEmail')
        .mockImplementation(async () => ({ confirmed: false }) as User);
      const deleteMock = jest
        .spyOn(usersService, 'delete')
        .mockImplementation(async () => 1);

      const result = await usersService.checkUniqueEmail({
        email,
        operationId,
      });

      expect(result).toBeUndefined();
      expect(deleteMock).toBeCalled();
    });

    it('find user confirmed', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByEmail')
        .mockImplementation(async () => ({ confirmed: true }) as User);

      await expect(
        usersService.checkUniqueEmail({ email, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.hasEmail.message);
    });
  });
  describe('checkUniqueNickName', () => {
    const nickName = 'nickName';
    const operationId = '2';

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('not found user', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByNickName')
        .mockImplementation(async () => null);

      await expect(
        usersService.checkUniqueNickName({ nickName, operationId }),
      ).resolves.toBeUndefined();
    });

    it('find user but not confirmed', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByNickName')
        .mockImplementation(async () => ({ confirmed: false }) as User);
      const deleteMock = jest
        .spyOn(usersService, 'delete')
        .mockImplementation(async () => 1);

      const result = await usersService.checkUniqueNickName({
        nickName,
        operationId,
      });

      expect(result).toBeUndefined();
      expect(deleteMock).toBeCalled();
    });

    it('find user confirmed', async () => {
      jest
        .spyOn(usersService.usersDatabase, 'getByNickName')
        .mockImplementation(async () => ({ confirmed: true }) as User);

      await expect(
        usersService.checkUniqueNickName({ nickName, operationId }),
      ).rejects.toThrowError(ERROR_MESSAGES.hasNickName.message);
    });
  });
});
