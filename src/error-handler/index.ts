import { ForbiddenException } from '@nestjs/common';
import { Error } from 'sequelize';

export const errorHandler = (err: Error | any) => {
  switch (err.name) {
    case 'SequelizeUniqueConstraintError':
      return new ForbiddenException(err.errors[0].message);
  }
};
