import type { EnvLog } from "@/types/envLog"; // EnvLog型のインポート
import { type FC, useEffect, useState } from "react"; // Reactの基本機能
import type { Socket } from "socket.io-client"; // Socket.ioの型
import useSWR from "swr"; // データ取得用フック

// サイト内の部品（オーガニズム）をimport
import APIKey from "../organisms/APIKey";
import Battery from "../organisms/Battery";
import Clock from "../organisms/Clock";
import Graph from "../organisms/Graph";
import Note from "../organisms/Note";
import PressureSensor from "../organisms/PressureSensor";
import Weather from "../organisms/Weather";

type Props = {
	socket: Socket; // Socket.ioのソケットをpropsで受け取る
};

const Component: FC<Props> = ({ socket }) => {
	// SWRで最新8件の環境ログを取得
	const { data, error, isLoading } = useSWR<EnvLog[]>("/env-logs?limit=8");

	// 最新のデータと過去データをstateで管理
	const [latest, setLatest] = useState<EnvLog | null>(null);
	const [pastData, setPastData] = useState<EnvLog[]>([]);

	useEffect(() => {
		if (data && data.length > 0) {
			// 取得したデータを日時順にソート（古い順）
			const sortedData = data.sort(
				(a, b) =>
					new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
			);
			// 最新データを配列の最後にセット
			setLatest(sortedData[sortedData.length - 1]);
			setPastData(sortedData);
		}
	}, [data]);

	useEffect(() => {
		// socketでリアルタイムのenv_log_updateイベントを受信
		socket.on("env_log_update", (newData: EnvLog) => {
			setPastData((prevPastData) => {
				// 受信したデータを既存の過去データに追加し、日時順に再ソート
				const updatedData = [...prevPastData, newData].sort(
					(a, b) =>
						new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
				);
				// 最新データを更新
				setLatest(updatedData[updatedData.length - 1]);
				return updatedData;
			});
		});

		// コンポーネントのアンマウント時にイベントリスナー解除
		return () => {
			socket.off("env_log_update");
		};
	}, [socket]);

	// エラー時の表示
	if (error) return <div className="text-red-500">Failed to load</div>;
	// ロード中または最新データがない場合の表示
	if (isLoading || !latest)
		return <div className="text-blue-500">Loading...</div>;

	return (
		// グリッドレイアウトで各オーガニズム（部品）を配置
		<div className="p-4 grid gap-4 grid-rows-8 grid-cols-12 h-full max-h-screen">
			{/* Noteコンポーネント：左上、ラージスクリーンでのみ表示 */}
			<div className="col-span-12 lg:col-span-3 row-span-4 relative bg-white shadow-lg rounded-lg p-4 order-7 lg:order-1 hidden lg:block">
				<Note />
			</div>

			{/* Weatherコンポーネント：中央上、ラージスクリーンで表示 */}
			<div className="col-span-12 lg:col-span-6 row-span-4 relative bg-white shadow-lg rounded-lg p-4 order-6 lg:order-2 hidden lg:block">
				<Weather />
			</div>

			{/* Clockコンポーネント：右上、ラージスクリーンで表示 */}
			<div className="col-span-12 lg:col-span-3 row-span-2 relative bg-white shadow-lg rounded-lg p-4 order-5 lg:order-3 hidden lg:block">
				<Clock />
			</div>

			{/* Batteryコンポーネント：中段右側 */}
			<div className="col-span-12 lg:col-span-3 row-span-1 relative bg-white shadow-lg rounded-lg p-4 order-4 lg:order-4 hidden lg:block">
				<Battery />
			</div>

			{/* APIKeyコンポーネント：Batteryの下 */}
			<div className="col-span-12 lg:col-span-3 row-span-1 relative bg-white shadow-lg rounded-lg p-4 order-3 lg:order-5 hidden lg:block">
				<APIKey />
			</div>

			{/* Graphコンポーネント：左下、大きめ */}
			<div className="col-span-12 lg:col-span-7 row-span-4 lg:row-span-4 relative bg-white shadow-lg rounded-lg p-4 order-2 lg:order-6">
				{/* 過去の環境ログデータを渡してグラフ表示 */}
				<Graph data={pastData} />
			</div>

			{/* PressureSensorコンポーネント：右下、大きめ */}
			<div className="col-span-12 lg:col-span-5 row-span-4 lg:row-span-4 relative bg-white shadow-lg rounded-lg p-4 order-1 lg:order-7">
				{/* 最新の環境ログデータを渡して気圧センサー表示 */}
				<PressureSensor data={latest} />
			</div>
		</div>
	);
};

export default Component;
