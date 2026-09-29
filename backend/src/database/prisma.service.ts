import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { createMultiTenancyExtension } from './prisma.extension';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * Client mở rộng với Multi-tenancy RLS:
   * Tự động lọc { where: { guildId } } theo ngữ cảnh của request hiện tại.
   */
  public readonly tenant: any;

  constructor(private readonly cls: ClsService) {
    super({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });

    this.tenant = this.$extends(createMultiTenancyExtension(this.cls));
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
