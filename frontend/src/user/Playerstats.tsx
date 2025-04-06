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

	function findAccount(ID: number): PlayerType | null
	{
		for (const account of accounts)
		{
			if (account.id === ID)
				return account;
		}
		return null;
	}

	function calcPercentile(worseThan: number, total: number): string
	{
		if (worseThan === 0)
			return "Number #1!";
		return `Top ${toPercentage(100 / ((total) / worseThan), 1)}%  -  #${worseThan + 1}`
	}

	function getPercentile(player: PlayerType, stat: keyof PlayerType): string
	{
		let worseThan = 0;
		
		for (const account of accounts)
		{
			if (account[stat] > player[stat])
				worseThan++;
		}
		return calcPercentile(worseThan, accounts.length - 1);
	}

	function calcWinPercent(player: PlayerType): number
	{
		if (player.wins === 0 && player.draws === 0 && player.losses === 0)
			return NaN;
		if (player.losses === 0)
			return 100;
		return 100 * (player.wins / (player.wins + player.draws + player.losses));
	}

	function getWinPercent(player: PlayerType): string
	{
		let winPercent = calcWinPercent(player);
		let worseThan = 0;
		let total = 0;

		if (Number.isNaN(winPercent))
			return "Play a match to see ranking"
		for (const account of accounts)
		{
			if (account.id === player.id)
				continue;
			let enemyWinPercent = calcWinPercent(account);
			if (Number.isNaN(enemyWinPercent))
				enemyWinPercent = 50;
			if (enemyWinPercent > winPercent)
				worseThan++;
			total++;
		}
		return calcPercentile(worseThan, total);
	}

	function StatWindow()
	{
		const { accounts, loggedInAccounts } = useAccountContext();
		const { indexPlayerStats, showPlayerStats } = useLoginContext();
		const [ index, setIndex ]  = useState(-1);
		const [profileImage, setProfileImage] = useState(Player);

		const currentAccount = accounts[indexPlayerStats]; //findAccount(indexPlayerStats);
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
									<div className="gap-y-2">
										<div className="text-4xl font-bold">
											ELO: {currentAccount?.elo}
										</div>
										<div className="italic text-xs font-medium text-gray-400">
											{getPercentile(currentAccount, 'elo')}
										</div>
									</div>
									<div className="gap-y-2">
										<div className="text-2xl font-bold">
											Win/Loss: {Number.isNaN(calcWinPercent(currentAccount)) ? "-" : toPercentage(calcWinPercent(currentAccount), 1) + "%"}
										</div>
										<div className="italic text-xs font-medium text-gray-400">
											{getWinPercent(currentAccount)}
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