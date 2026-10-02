import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class DeductDto {
  @ApiProperty({ description: 'Số lượng Vàng muốn trừ/tiêu', example: 200 })
  @IsInt({ message: 'Số lượng vàng phải là số nguyên' })
  @IsPositive({ message: 'Số lượng trừ phải lớn hơn 0' })
  @Min(1, { message: 'Tối thiểu trừ 1 Vàng' })
  amount: number;

  @ApiPropertyOptional({ description: 'Phiên bản ví hiện tại để kiểm tra xung đột (Optimistic Lock)', example: 0 })
  @IsOptional()
  @IsInt({ message: 'Version phải là số nguyên' })
  version?: number;
}
