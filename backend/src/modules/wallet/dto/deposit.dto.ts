import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class DepositDto {
  @ApiProperty({ description: 'Số lượng Vàng muốn nạp', example: 500 })
  @IsInt({ message: 'Số lượng vàng phải là số nguyên' })
  @IsPositive({ message: 'Số lượng nạp phải lớn hơn 0' })
  @Min(1, { message: 'Tối thiểu nạp 1 Vàng' })
  amount: number;

  @ApiPropertyOptional({ description: 'Phiên bản ví hiện tại (Optimistic Locking version)', example: 0 })
  @IsOptional()
  @IsInt({ message: 'Version phải là số nguyên' })
  version?: number;
}
