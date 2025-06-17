import type { FC } from "react";
import { Link } from "react-router"; // ルーティング用のLinkコンポーネントをimport

const Component: FC = () => {
	return (
		// 画面全体の高さを取り、中央寄せの縦横センター揃えにする
		<div className="h-screen flex flex-col justify-center items-center text-center space-y-4">
			{/* 404エラーメッセージの見出し */}
			<h1 className="text-4xl font-bold text-gray-800">404 - Page Not Found</h1>

			{/* ページが見つからないことを伝える説明文 */}
			<p className="text-gray-600">
				Sorry, the page you're looking for does not exist.
			</p>

			{/* ホームページへ戻るリンク */}
			<Link to="/" className="text-blue-500 hover:underline text-lg">
				Go back to homepage
			</Link>
		</div>
	);
};

export default Component;
