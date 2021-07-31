import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class Script {
  @PrimaryGeneratedColumn() id: number

  @Column() command: string

  @Column({ default: '~' }) workingDir: string
}
