import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { Device } from "./Device";

@Entity()
export class EnvLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Device, (device) => device.envLog)
  device!: Device;

  @Column("float")
  temperatureSht!: number;

  @Column("float")
  temperatureQmp!: number;

  @Column("float")
  humidity!: number;

  @Column("float")
  pressure!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
