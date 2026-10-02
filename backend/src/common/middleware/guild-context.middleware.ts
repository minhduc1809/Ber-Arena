import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';

/**
 * Middleware đọc header `x-guild-id` và lưu vào ClsService (AsyncLocalStorage).
 * Ngữ cảnh này sẽ tồn tại suốt vòng đời của request mà không cần truyền biến thủ công.
 */
@Injectable()
export class GuildContextMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const guildIdHeader = req.headers['x-guild-id'];

    if (guildIdHeader && typeof guildIdHeader === 'string') {
      this.cls.set('guildId', guildIdHeader.trim());
    } else {
      this.cls.set('guildId', null);
    }

    next();
  }
}
