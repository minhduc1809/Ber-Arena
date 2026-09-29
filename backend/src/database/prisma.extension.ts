import { Prisma } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

// Danh sách các models có quan hệ trực tiếp với Bang hội (Tenant)
const TENANT_MODELS = ['User'];

/**
 * Prisma Extension tự động chèn { where: { guildId } } vào mọi câu query đọc/tìm kiếm.
 * Đảm bảo dữ liệu bang hội được cô lập tuyệt đối (Row-Level Security) ở tầng sâu nhất.
 */
export function createMultiTenancyExtension(cls: ClsService) {
  return Prisma.defineExtension({
    name: 'multiTenancyRLS',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const guildId = cls.get<string | null>('guildId');

          // Chỉ can thiệp nếu request có guildId và model thuộc diện quản lý tenant
          if (guildId && model && TENANT_MODELS.includes(model)) {
            const readOperations = ['findMany', 'findFirst', 'count', 'aggregate', 'groupBy'];

            if (readOperations.includes(operation)) {
              const currentArgs = (args || {}) as { where?: Record<string, any> };
              currentArgs.where = {
                ...currentArgs.where,
                guildId,
              };
              return query(currentArgs);
            }
          }

          return query(args);
        },
      },
    },
  });
}
