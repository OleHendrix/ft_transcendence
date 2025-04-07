import { useAccountContext } from "../contexts/AccountContext";
import { useLoginContext } from "../contexts/LoginContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdClose } from "react-icons/io";
import Player from "../../assets/Player.svg";
import { MatchHistory, PlayerType } from "../types";
import { toPercentage } from "../Leaderboard";

function ShowMatchHistory()
{
	const { accounts, loggedInAccounts } = useAccountContext();
	const { indexPlayerStats } = useLoginContext();

	const selectedAccount = loggedInAccounts?.[indexPlayerStats];
	const account = accounts.find(acc => acc.id === selectedAccount?.id);
	const matchHistory = account?.matches ?? [];
	const sortedMatchHistory = [...matchHistory].sort((a, b) => b.id - a.id);

	console.log(matchHistory);
	console.log("Accounts:", accounts);
	console.log("LoggedIn:", loggedInAccounts);
	return (
		<div className="w-full h-80 overflow-y-auto rounded-lg border border-base-content/5 bg-transparent">
			<table className="table w-full text-center">
				<thead>
					<tr className="text-lg font-light bg-[#303030]/90 text-lightgrey">
						<th className="w-100 text-center" colSpan={6}>Match History</th>
					</tr>
				</thead>
				<tbody>
					{sortedMatchHistory.map((match, index) => (
						<tr
							key={match.id}
							className={
								match.winner === match.p1 ? "bg-gradient-to-r from-[#2c8a39] to-[#1f4b28]" : "bg-gradient-to-r from-[#e02e2e] to-[#8b1313]"}
						>
							<td className="text-left">{sortedMatchHistory[index].p1}</td>
							<td className="text-left text-xs">
								{`${sortedMatchHistory[index].p1Elo} (${sortedMatchHistory[index].p1Diff >= 0 ? `+${sortedMatchHistory[index].p1Diff}` : sortedMatchHistory[index].p1Diff})`}
							</td>
							<td className="text-right text-[#ff914d]">{sortedMatchHistory[index].p1score}</td>
							<td className="text-left  text-[#134588]">{sortedMatchHistory[index].p2score}</td>
							<td className="text-right  text-xs">
								{`${sortedMatchHistory[index].p2Elo} (${sortedMatchHistory[index].p2Diff >= 0 ? `+${sortedMatchHistory[index].p2Diff}` : sortedMatchHistory[index].p1Diff})`}
							</td>
							<td className="text-right">{sortedMatchHistory[index].p2}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

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

	function calcWorseThan(player: PlayerType, stat: keyof PlayerType): [number, number]
	{
		let worseThan = 0;
		let total = 0;
		
		for (const account of accounts)
		{
			if (account.id === player.id || account[stat] === null)
				continue;
			if (account[stat] > player[stat])
				worseThan++;
			total++;
		}
		return [worseThan, total];
	}

	function getPercentile(player: PlayerType, stat: keyof PlayerType): string
	{
		if (player[stat] === null)
			return "Play a match to see ranking";
		const [worseThan, total] = calcWorseThan(player, stat);

		if (worseThan === 0)
			return "Number #1!";
		return `Top ${toPercentage(100 / (total / worseThan), 1)}% - #${worseThan + 1}`
	}

	function redYellowGradient(val: number, range: number)
	{
		if (Number.isNaN(val))
			return "#777700";

		const midpoint = (100 - range) / 2;
		const normalized = (val - midpoint) / range;
	
		const r = Math.max(0, Math.min(255, 255 - normalized * 255));
		const g = Math.max(0, Math.min(255, normalized * 255));
	
		const toHex = (v: number) => Math.round(v).toString(16).padStart(2, '0');
		const str = `#${toHex(r)}${toHex(g)}00`;
		console.log(str);
		return str;
	}

	function GetGradientStyle(val: number, max: number): React.CSSProperties
	{
		console.log(val);
		const percentage = val === null ? 50 :  Math.max(0, Math.min(((val / max) * 100), 100));
		const colour = redYellowGradient(percentage, 20);
	
		return {
			background: `linear-gradient(to right, ${colour}40 0%, ${colour}35 ${Math.max(percentage - 3, 1)}%, ${colour}10 ${Math.min(percentage + 3, 99)}%, ${colour}08 100%)`
		};
	}

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
					className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 bg-[#1a1a1a]/90"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<motion.div
						className="flex-col items-center bg-[#2a2a2a]/90 backdrop-blur-md text-white p-8 gap-8 rounded-xl w-full min-w-[400px] min-h-[700px] max-w-xl max-h-[700px] relative shadow-2xl"
						initial={{ scale: 0.9, y: 20 }}
						animate={{ scale: 1, y: 0 }}
						exit={{ scale: 0.9, y: 20 }}
						transition={{ type: "spring", stiffness: 300, damping: 25 }}
					>
						<button
							className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-neutral-700 p-1 rounded transition"
							onClick={() => setShowStats(false)}
						>
							<IoMdClose size={24} />
						</button>

						<header className="relative flex items-center justify-center gap-x-2 text-5xl mb-4 border-b border-neutral-700 pb-4">
							{currentAccount?.username}
							<img
								src={profileImage}
								className="h-14 w-14 rounded-full object-cover shadow-md hover:scale-105 transition-transform duration-300"
							/>
						</header>

						<main className="flex h-full gap-x-4 text-2xl text-center">
							<div className="w-2/4">
								<div className="flex flex-col gap-y-4 mb-6">
									<div className="w-full grid grid-cols-3 gap-2 p-2 -mt-4 -mb-4">
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

									<div
										className="flex flex-col p-3 rounded-md shadow-inner backdrop-blur-sm border border-neutral-800"
										style={{ ...GetGradientStyle(currentAccount?.elo, 800) }}
									>
										<div className="text-2xl font-medium">Rating: {currentAccount?.elo}</div>
										<div className="italic text-xs font-medium text-gray-400">
											{getPercentile(currentAccount, 'elo')}
										</div>
									</div>

									<div
										className="flex flex-col p-3 rounded-md shadow-inner backdrop-blur-sm border border-neutral-800"
										style={{ ...GetGradientStyle(currentAccount?.winRate, 100) }}
									>
										<div className="text-2xl font-medium">
											Win rate: {currentAccount?.winRate === null ? '-' : toPercentage(currentAccount?.winRate, 1) + "%"}
										</div>
										<div className="italic text-xs font-medium text-gray-400">
											{getPercentile(currentAccount, 'winRate')}
										</div>
									</div>
									

									<div
										className="flex flex-col p-3 rounded-md shadow-inner backdrop-blur-sm border border-neutral-800"
										style={{ ...GetGradientStyle(currentAccount?.winRate, 100) }}
									>
										<div className="text-2xl font-medium">
											Win rate: {currentAccount?.winRate === null ? '-' : toPercentage(currentAccount?.winRate, 1) + "%"}
										</div>
										<div className="italic text-xs font-medium text-gray-400">
											{getPercentile(currentAccount, 'winRate')}
										</div>
									</div>

									<div
										className="flex flex-col p-3 rounded-md shadow-inner backdrop-blur-sm border border-neutral-800"
										style={{ ...GetGradientStyle(currentAccount?.winRate, 100) }}
									>
										<div className="text-2xl font-medium">
											Win rate: {currentAccount?.winRate === null ? '-' : toPercentage(currentAccount?.winRate, 1) + "%"}
										</div>
										<div className="italic text-xs font-medium text-gray-400">
											{getPercentile(currentAccount, 'winRate')}
										</div>
									</div>
								</div>
							</div>

							<div className="w-1/2">
								<ShowMatchHistory />
							</div>
						</main>
					</motion.div>
				</motion.div>
			</AnimatePresence>
		);
	}
}

export default PlayerStats