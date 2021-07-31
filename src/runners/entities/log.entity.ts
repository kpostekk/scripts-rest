import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Scripts } from '../../scripts/scripts.entity'

@Entity()
export class RunLog {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'datetime', default: Date.now })
  runDate: number

  @Column()
  runId: string

  @Column()
  status: 'Started' | 'Finished' | 'Errored'

  @ManyToOne('Scripts')
  script: Scripts
}
