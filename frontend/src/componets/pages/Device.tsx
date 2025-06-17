import type { Device } from "@/types/device"; // Device型のインポート
import { type FC, useEffect, useState } from "react"; // React基本機能のインポート
import type { Socket } from "socket.io-client"; // socket.ioの型インポート
import useSWR from "swr"; // データ取得用フック

type Props = {
	socket: Socket; // socket.ioのソケットをpropsで受け取る
};

const Component: FC<Props> = ({ socket }) => {
	// フィルター条件を定義（metrics収集有効なデバイスのみ取得）
	const filter = { collectMetrics: true };
	const queryParams = new URLSearchParams();
	queryParams.append("filter", JSON.stringify(filter));

	// SWRを使ってAPIからフィルター付きでデバイス一覧を取得
	const { data, error, isLoading } = useSWR(
		`/devices?${queryParams.toString()}`,
	);

	// 選択中（または表示中）のデバイス情報をstateで保持
	const [device, setDevice] = useState<Device | null>(null);

	useEffect(() => {
		// データ取得時に配列の最初のデバイスを選択してセット
		if (data && data.length > 0) {
			setDevice(data[0]);
		}

		// socketのdevice_updateイベントでリアルタイム更新を反映
		socket.on("device_update", (newData: Device) => {
			setDevice(newData);
		});

		// コンポーネントのアンマウント時にイベントリスナー解除
		return () => {
			socket.off("device_update");
		};
	}, [socket, data]);

	// エラー時はエラーメッセージ表示
	if (error) return <div className="text-red-500">Failed to load</div>;
	// ロード中はローディング表示
	if (isLoading) return <div className="text-blue-500">Loading...</div>;

	return (
		<div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-6">
			{device ? (
				<div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
					<div className="p-8">
						{/* デバイス名と場所 */}
						<h2 className="text-3xl font-bold text-gray-800 mb-3">
							{device.name}
						</h2>
						<p className="text-sm text-gray-500 mb-6">{device.location}</p>

						{/* デバイス詳細情報の表示 */}
						<div className="space-y-5">
							<div className="flex justify-between items-center">
								<span className="text-gray-600 font-medium">MAC Address:</span>
								<span className="text-gray-700">{device.macAddress}</span>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-gray-600 font-medium">IP Address:</span>
								<span className="text-gray-700">{device.ipAddress}</span>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-gray-600 font-medium">
									Registered At:
								</span>
								{/* 登録日時をローカルな見やすい日時文字列に変換 */}
								<span className="text-gray-700">
									{new Date(device.registeredAt).toLocaleString()}
								</span>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-gray-600 font-medium">
									Metrics Collection:
								</span>
								{/* collectMetricsがtrueなら緑でEnabled、falseなら赤でDisabledを表示 */}
								<span
									className={`font-semibold ${
										device.collectMetrics ? "text-green-600" : "text-red-600"
									}`}
								>
									{device.collectMetrics ? "Enabled" : "Disabled"}
								</span>
							</div>
						</div>
					</div>
				</div>
			) : (
				// デバイスが見つからなければメッセージ表示
				<div className="text-center text-gray-500">No devices found.</div>
			)}
		</div>
	);
};

export default Component;
