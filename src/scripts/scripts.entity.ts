import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity()
export class Script {
  @ApiProperty({ example: 420, readOnly: true })
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty({ example: 'sudo shutdown 15 -h' })
  @Column()
  command: string

  @ApiProperty({ example: '/home/kpostek/anything' })
  @Column({ default: '~' })
  workingDir: string

  @ApiProperty({ example: 'shutdown' })
  @Column({ nullable: true, unique: true })
  alias?: string
}
