import { CanActivate, ExecutionContext, Injectable, SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from 'src/modules/auth/auth.service';
import { PermissionCodeEnum } from '@/common/enums/permission.enum';
import { getGuardReqRes } from '../utils';
import { TokenGuard } from '../token/token.guard';
import { MetadataKeyEnum } from '@/common/enums/metadata-key.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector
  ) {}
  async canActivate(context: ExecutionContext) {
    const { req, res } = getGuardReqRes(context)
    const authCode = this.reflector.getAllAndOverride<PermissionCodeEnum>(
      MetadataKeyEnum.AUTH_CODE,
      [context.getHandler(), context.getClass()],
    )
    if (!req.user.roleId) {
      res.status(403).send({ code: 403, message: '无权访问' })
      return false
    }
    const result = await this.authService.checkPermissionCode(req.user.roleId.toString(), authCode)
    if (result) return true
    res.status(403).send({ code: 403, message: '无权访问' })
    return false
  }
}

export function UseAuth(code: PermissionCodeEnum | PermissionCodeEnum[]) {
  return applyDecorators(
    SetMetadata(MetadataKeyEnum.AUTH_CODE, code),
    UseGuards(TokenGuard, AuthGuard)
  )
}
