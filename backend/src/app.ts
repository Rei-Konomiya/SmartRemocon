/**
 * サーバー起動スクリプト
 * 
 * このスクリプトは、Expressを使用して基本的なHTTPサーバーを起動します。
 * JSONリクエストボディの解析ミドルウェアを設定し、指定されたポートで待ち受けます。
 * 
 * 使用技術:
 * - Express（Webフレームワーク）
 * - Node.js httpモジュール
 * 
 *  Date : 2025/04/01 - 2025/07/31
 *  Author : K.Murakami
 */

import { AppDataSource } from "./data-source";
import { EnvLog } from "./entity/EnvLog";
import { Device } from "./entity/Device";

// データベース接続
AppDataSource.initialize()
  .then(() => {
    console.log("Database connected.");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });


import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  path: "/socket.io", // デフォルトなので省略可
  cors: { origin: "*" }, // 開発環境用に適宜設定
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // イベント受信例
  socket.on("message", (msg) => {
    console.log("Received message:", msg);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(8000, () => {
  console.log("Server running on port 8000");
});


// 最新の環境データをメモリで保持（初期値はダミー）
let latestEnvData = {
  temperatureSht: 0,
  temperatureQmp: 0,
  humidity: 0,
  pressure: 0,
  updatedAt: new Date(),
};
// 環境ログをメモリに保存する配列（最新順）
const envLogs: any[] = [];

// POST /env-logs （すでにあるエンドポイント）内でログを保存
app.post('/api/env-logs', async (req, res) => {
  const { temperatureSht, temperatureQmp, humidity, pressure } = req.body;

  if (
    typeof temperatureSht === 'number' &&
    typeof temperatureQmp === 'number' &&
    typeof humidity === 'number' &&
    typeof pressure === 'number'
  ) {
    const newEntry = {
      id: envLogs.length + 1,
      temperatureSht,
      temperatureQmp,
      humidity,
      pressure,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // メモリ保存
    envLogs.unshift(newEntry);
    latestEnvData = newEntry;

    // DB保存も追加
    try {
      const deviceRepo = AppDataSource.getRepository(Device);
      let device = await deviceRepo.findOneBy({ id: 1 });
      if (!device) {
        device = deviceRepo.create({
          macAddress: "00:11:22:33:44:55",
          ipAddress: "192.168.0.100",
          name: "ダミーデバイス",
          location: "オフィスA",
          collectMetrics: true,
          registeredAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await deviceRepo.save(device);
      }

      const envLogRepo = AppDataSource.getRepository(EnvLog);
      const log = envLogRepo.create({
        device,
        temperatureSht,
        temperatureQmp,
        humidity,
        pressure,
      });
      await envLogRepo.save(log);
    } catch (err) {
      console.error("DB保存エラー:", err);
    }

    res.status(200).json({ message: "保存成功", data: newEntry });
  } else {
    res.status(400).json({ message: "不正なデータ形式です" });
  }
});


// 追加：GET /env-logs で最新N件を取得（limit指定あり）
app.get('/api/env-logs', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 28;
  res.json(envLogs.slice(0, limit));
});
