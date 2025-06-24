import "reflect-metadata";
import { DataSource } from "typeorm";
import { EnvLog } from "./entity/EnvLog";
import { Device } from "./entity/Device";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "database", // docker-compose の service 名
  port: 3306,
  username: "user",
  password: "password",
  database: "database",
  synchronize: true,
  logging: true,
  entities: [EnvLog, Device],
});
