export type DefaultInfo = {
  operationId: string;
};

export type SendMailOptions = {
  subject: string;
  text: string;
  code: string;
  email: string;
} & DefaultInfo;
