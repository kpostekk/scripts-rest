import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Scripts } from '../../scripts/scripts.entity'

@Entity()
export class RunResult {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  runId: string

  @Column()
  text: string

  @ManyToOne('Scripts')
  script: Scripts
}
