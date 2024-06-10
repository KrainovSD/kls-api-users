import { InjectS3, S3Service } from '@krainovsd/nest-uploading-service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { Settings, User, UserCreationArgs } from '@database';
import { USER_FORBIDDEN_FIELDS, USER_PRIVATE_FIELDS } from '@constants';

import { DefaultInfo, GetByIdOptions } from './users.typings';
import { DeleteUsersDto } from './dto';

@Injectable()
export class UsersDatabase {
  constructor(
    @InjectModel(User) private readonly userRepo: typeof User,
    @InjectS3() private readonly s3Service: S3Service,
  ) {}

  private readonly forbiddenFields = USER_FORBIDDEN_FIELDS;
  private readonly privateFields = USER_PRIVATE_FIELDS;

  async getByEmail(email: string, _: DefaultInfo) {
    return this.userRepo.findOne({ where: { email } });
  }
  async getByNickName(nickName: string, _: DefaultInfo) {
    return this.userRepo.findOne({ where: { nickName } });
  }
  async getByIdWithSettings(id: string, _: DefaultInfo) {
    return this.userRepo.findByPk(id, {
      include: [Settings],
    });
  }
  async getById({ id, privateFields = false }: GetByIdOptions) {
    return this.userRepo.findByPk(id, {
      attributes: {
        exclude: privateFields
          ? this.forbiddenFields
          : [...this.forbiddenFields, ...this.privateFields],
      },
      include: [Settings],
    });
  }
  async getAllExceptOne(userId: string, _: DefaultInfo) {
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
  async getByEmailChangeKey(key: string, _: DefaultInfo) {
    return this.userRepo.findOne({ where: { emailChangeKey: key } });
  }
  async getByPasswordChangeKey(key: string, _: DefaultInfo) {
    return this.userRepo.findOne({
      where: { passwordChangeKey: key },
    });
  }
  async getByEmailOrNickName(login: string, _: DefaultInfo) {
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
  async getByTokenAndId(id: string, token: string, _: DefaultInfo) {
    return this.userRepo.findOne({
      where: {
        [Op.and]: [{ token }, { id }],
      },
    });
  }
  async create(dto: UserCreationArgs, _: DefaultInfo) {
    return this.userRepo.create(dto);
  }
  async delete(id: string, _: DefaultInfo) {
    return this.userRepo.destroy({ where: { id } });
  }
  async deleteAll(dto: DeleteUsersDto, _: DefaultInfo) {
    return this.userRepo.destroy({
      where: {
        id: dto.ids,
      },
    });
  }

  async saveFile(key: string, payload: Buffer, info: DefaultInfo) {
    return this.s3Service.putItem({ key, payload, ...info });
  }
  async deleteFile(key: string, info: DefaultInfo) {
    return this.s3Service.deleteItem({ key, ...info });
  }
}
