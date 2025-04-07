import { useAccountContext } from "../contexts/AccountContext";
import { useLoginContext } from "../contexts/LoginContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdClose } from "react-icons/io";
import Player from "../../assets/Player.svg";
import { PlayerType } from "../types";
import { toPercentage } from "../Leaderboard";

function PlayerStats()
{
	const { accounts, loggedInAccounts } = useAccountContext();
	const { indexPlayerStats, showPlayerStats } = useLoginContext();
	const [ index, setIndex ]  = useState(-1);
	const [ showStats, setShowStats ] = useState(false);

	useEffect(() =>
	{
		setIndex(loggedInAccounts[indexPlayerStats].id - 2);
	}, [ showPlayerStats ]);

	return (
		<>
			<motion.button className="pt-2 bg-[#ff914d] px-4 py-2 font-bold shadow-2xl rounded-3xl hover:bg-[#ab5a28] hover:cursor-pointer"
				whileHover={{ scale: 1.03 }}
				whileTap={{ scale: 0.97 }}
				onClick={() => { setShowStats(true) }}>Show stats
			</motion.button>
			{showStats && <StatWindow />}
		</>
	)

	function calcWorseThan(player: PlayerType, stat: keyof PlayerType): number
	{
		let worseThan = 0;
		
		for (const account of accounts)
		{
			if (account[stat] > player[stat])
				worseThan++;
		}
		return worseThan;
	}

	function getPercentile(player: PlayerType, stat: keyof PlayerType): string
	{
		const worseThan = calcWorseThan(player, stat);

		if (worseThan === 0)
			return "Number #1!";
		return `Top ${toPercentage(100 / ((accounts.length - 1) / worseThan), 1)}% - #${worseThan + 1}`
	}

	function GetGradientStyle(player: PlayerType, stat: keyof PlayerType): React.CSSProperties
	{
		const worseThan = calcWorseThan(player, stat);
		const percentage = worseThan === 0 ? 100 : ((accounts.length - 1) / worseThan) * 100;
		const colour = percentage >= 50 ? "#00FF00" : "#FF0000";

		return {
			background: `linear-gradient(to right, ${colour}40 0%, ${colour}35 ${Math.max(percentage - 10, 0)}%, ${colour}15 ${Math.min(percentage + 10, 100)}%, ${colour}10 100%)`
		};
	}

	// function getWinPercent(player: PlayerType): string
	// {
	// 	let winPercent = calcWinPercent(player);
	// 	let worseThan = 0;
	// 	let total = 0;

	// 	if (Number.isNaN(winPercent))
	// 		return "Play a match to see ranking"
	// 	for (const account of accounts)
	// 	{
	// 		if (account.id === player.id)
	// 			continue;
	// 		let enemyWinPercent = calcWinPercent(account);
	// 		if (Number.isNaN(enemyWinPercent))
	// 			enemyWinPercent = 50;
	// 		if (enemyWinPercent > winPercent)
	// 			worseThan++;
	// 		total++;
	// 	}
	// 	return calcPercentile(worseThan, total);
	// }

	function StatWindow()
	{
		const { accounts, loggedInAccounts } = useAccountContext();
		const { indexPlayerStats, showPlayerStats } = useLoginContext();
		const [ index, setIndex ]  = useState(-1);
		const [profileImage, setProfileImage] = useState(Player);

		const currentAccount = accounts[loggedInAccounts[indexPlayerStats].id - 2]; //findAccount(indexPlayerStats);
		if (currentAccount === null)
			return;

		return (
			<AnimatePresence>
				<motion.div
					className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 bg-[#1a1a1a]"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<motion.div
						className="flex-col items-center bg-[#2a2a2a]/90 text-white p-8 gap-8 rounded-lg w-full min-w-[400px] min-h-[700px] max-w-xl max-h-[700px] relative shadow-xl"
						initial={{ scale: 0.9, y: 20 }}
						animate={{ scale: 1, y: 0 }}
						exit={{ scale: 0.9, y: 20 }}
						transition={{ type: "spring", stiffness: 300, damping: 25 }}
					>
						<button className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer"
							onClick={() => setShowStats(false)}>
							<IoMdClose size={24} />
						</button>
						
						<header className="relative flex items-center justify-center gap-x-2 text-4xl mb-4">
								{currentAccount?.username}
								<img src={profileImage} className="h-12 w-12 rounded-full object-cover shadow-md" />
						</header>

						<hr className="border-t-[2px] border-dotted border-gray-500 my-4 custom-dotted-line" />

						<main className="flex h-full gap-x-4 text-2xl text-center">
							<div className="w-2/4">
								<div className="flex flex-col gap-y-4">
									<div className="flex flex-col border-t-[2px] border border-gray-500 p-2 rounded"
										style={GetGradientStyle(currentAccount, 'elo')}>
										<div className="text-3xl font-bold">
											Rating: {currentAccount?.elo}
										</div>
										<div className="italic text-xs font-medium text-gray-400">
											{getPercentile(currentAccount, 'elo')}
										</div>
									</div>
									<div className="flex flex-col border-t-[2px] border border-gray-500 p-2 rounded"
										style={GetGradientStyle(currentAccount, 'elo')}>
										<div className="text-3xl font-bold">
											Win rate: {currentAccount?.winRate === null ? 'NaN' : currentAccount?.winRate + "%"}
										</div>
										<div className="italic text-xs font-medium text-gray-400">
											{getPercentile(currentAccount, 'winRate')}
										</div>
									</div>
								</div>

								<div className="w-full grid grid-cols-3 gap-2 p-2 mt-2">
									<div className="stat flex flex-col items-center">
										<div className="stat-title text-green-800 font-black">Wins</div>
										<div className="stat-value">{currentAccount?.wins}</div>
									</div>
									<div className="stat flex flex-col items-center">
										<div className="stat-title font-black">Draws</div>
										<div className="stat-value">{currentAccount?.draws}</div>
									</div>
									<div className="stat flex flex-col items-center">
										<div className="stat-title text-red-800 font-black">Losses</div>
										<div className="stat-value">{currentAccount?.losses}</div>
									</div>
								</div>
							</div>

							<div className="border-l-[2px] border-dotted border-gray-500 h-[580px]"></div>

							<div className="flex-1">
								Match history
							</div>
						</main>
					</motion.div>
				</motion.div>
			</AnimatePresence>
		);
	}
}

export default PlayerStats