import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Error } from 'sequelize';

export const errorHandler = (err: Error | any) => {
  switch (err.name) {
    case 'SequelizeUniqueConstraintError':
      return new ForbiddenException(err.errors[0].message);
    case 'SequelizeForeignKeyConstraintError':
      return new NotFoundException(`${err.table.slice(0, -1)} does not exist`);
    case 'SequelizeValidationError':
      return new BadRequestException(err.errors[0].message);
    default:
      return new BadRequestException(err);
  }
};
