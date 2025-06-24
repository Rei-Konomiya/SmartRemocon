import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { EnvLog } from "./EnvLog";

@Entity()
export class Device {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  macAddress!: string;

  @Column()
  ipAddress!: string;

  @Column()
  name!: string;

  @Column()
  location!: string;

  @Column()
  collectMetrics!: boolean;

  @Column()
  registeredAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => EnvLog, (envLog) => envLog.device)
  envLog!: EnvLog[];
}
