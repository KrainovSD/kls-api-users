import config from './config.json';

export const EXPIRES_COOKIES = config.settings.expiresCookies;
export const EXPIRES_CACHE = config.settings.expiresCache;
export const SALT_ROUNDS = config.settings.saltRounds;
export const ROUTE_PREFIX = config.settings.routePrefix;
export const CURRENT_SERVICE = config.settings.currentService;
export const SERVICES = config.settings.services.info;
export const SERVICES_EVENTS = config.settings.services.events;
export const MAX_SIZE_AVATAR = config.settings.uploads.maxSizeAvatar;
export const MAX_SIZE_WALLPAPER = config.settings.uploads.maxSizeWallpaper;
export const MIME_TYPE_AVATAR = new RegExp(
  config.settings.uploads.mimeTypeAvatar,
);
export const MIME_TYPE_WALLPAPER = new RegExp(
  config.settings.uploads.mimeTypeWallpaper,
);
export const USER_SETTINGS_DEFAULT = config.settings.defaultUserSettings;

export const SWAGGER_DESCRIPTION = config.texts.swagger.descriptions;
export const RESPONSE_MESSAGES = config.texts.responses;
export const ERROR_MESSAGES = config.texts.errors;
export const MAIL_MESSAGES_OPTION = config.texts.mail.messages;

// export const RESPONSE_MESSAGES = {
//   success: { message: 'Успешно' },
//   sendEmail: {
//     message:
//       'На вашу электронную почту был отправлен уникальный ключ для завершения операции',
//   },
//   sendNewEmail: {
//     message:
//       'На указанную вами электронную почту был отправлен уникальный ключ для завершения операции',
//   },
// };
// export const ERROR_MESSAGES = {
//   badKeyOrTime: 'Неверный формат уникального ключа или истекло время операции',
//   oftenChage: 'Менять данные можно не чаще, чем раз в 24 часа',
//   oftenTryChange:
//     'Перед попытками поменять данные должно пройти некоторое время',
//   hasNickName: 'Указанный вами псевдоним уже используется другим пользователем',
//   hasEmail:
//     'Указанный вами адрес электронной почты уже используется другим пользователем',
//   changeNickName: 'Менять псевдоним можно не чаще, чем раз в месяц',
//   userNotFound: 'Информация о пользователе не найдена',
//   infoNotFound: 'Служебная информация не найдена',
//   badEmail: 'Неверный адрес электронной почты',
// };
