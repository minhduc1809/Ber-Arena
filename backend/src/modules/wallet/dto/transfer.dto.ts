import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, Min } from 'class-validator';

export class TransferDto {
  @ApiProperty({ description: 'ID người nhận Vàng', example: 'uuid-nguoi-nhan' })
  @IsString({ message: 'toUserId phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'toUserId không được để trống' })
  toUserId: string;

  @ApiProperty({ description: 'Số lượng Vàng chuyển', example: 100 })
  @IsInt({ message: 'Số lượng vàng phải là số nguyên' })
  @IsPositive({ message: 'Số lượng chuyển phải lớn hơn 0' })
  @Min(1, { message: 'Tối thiểu chuyển 1 Vàng' })
  amount: number;
}
