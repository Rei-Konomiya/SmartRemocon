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


// Expressライブラリをインポート（Node.jsのWebアプリケーションフレームワーク）
import express from 'express';

// httpモジュールをインポート（Node.jsの標準モジュール、HTTPサーバーを作成するために使用）
import http from 'http';

// expressアプリケーションのインスタンスを作成
const app = express();

// HTTPサーバーをexpressアプリを基に作成
const server = http.createServer(app);

// 受信するリクエストのボディをJSONとして自動的に解析するミドルウェアを追加
app.use(express.json());

// サーバーがリッスンするポート番号を指定
const port = 8000;

// 指定したポートでHTTPサーバーを起動し、起動成功時にメッセージを出力
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
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
app.post('/env-logs', (req, res) => {
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
    envLogs.unshift(newEntry); // 新しいデータを先頭に追加
    latestEnvData = newEntry;
    res.status(200).json({ message: '環境値を更新しました', data: newEntry });
  } else {
    res.status(400).json({ message: '不正なデータ形式です' });
  }
});

// 追加：GET /env-logs で最新N件を取得（limit指定あり）
app.get('/env-logs', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 28;
  res.json(envLogs.slice(0, limit));
});
