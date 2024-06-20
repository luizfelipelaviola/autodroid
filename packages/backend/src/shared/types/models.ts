import { Prisma } from "@prisma/client";

type Required<T> = {
  [P in keyof T]-?: T[P];
};

type PrismaEntityType<T> = Required<Omit<T, "_count">>;

export type UserEntityType = PrismaEntityType<
  Prisma.UserGetPayload<{
    include: {
      [key in keyof Prisma.UserInclude]: true;
    };
  }>
>;

export type UserAuthProviderConnEntityType = PrismaEntityType<
  Prisma.UserAuthProviderConnGetPayload<{
    include: {
      [key in keyof Prisma.UserAuthProviderConnInclude]: true;
    };
  }>
>;
