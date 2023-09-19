import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

export enum Role {
  User = 'userId',
  Admin = 'adminId',
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return false;
    }

    const { user } = context.switchToHttp().getRequest();

    // do the rest and return either true or false
    try {
      if (!user) {
        throw new UnauthorizedException();
      }

      return requiredRoles.some((role) => {
        if (user && user[role]) return true;
        else return false;
      });
    } catch (error) {
      throw error;
    }
  }
}
