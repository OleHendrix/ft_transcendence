import { useAccountContext } from "../contexts/AccountContext";
import { useLoginContext } from "../contexts/LoginContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdClose, IoIosStats } from "react-icons/io";
import { RiGamepadLine } from "react-icons/ri";
import Player from "../../assets/Player.svg";
import { MatchHistory, PlayerType } from "../types";
import { toPercentage } from "../Leaderboard";
import { format } from 'date-fns';

function ShowMatchHistory()
{
	const { accounts, loggedInAccounts } = useAccountContext();
	const { indexPlayerStats } = useLoginContext();

	const selectedAccount = loggedInAccounts?.[indexPlayerStats];
	const currentAccount = accounts.find(acc => acc.id === selectedAccount?.id);
	if (currentAccount === null)
		return "";
	const matchHistory = currentAccount?.matches ?? [];
	const SMH = [...matchHistory].sort((a, b) => b.id - a.id); //SortedMatchHistory

	return (
		<div className="border border-base-content/20 bg-transparent h-126 overflow-y-auto">
			<table className="w-full table overflow-y-auto whitespace-nowrap">
				<thead className="sticky top-0 z-10 bg-black shadow-2xl">
					<tr className="text-lg font-light bg-[#303030]/90 text-lightgrey">
						<th className="text-center" colSpan={6}>
						<div className="flex w-full items-center justify-center gap-1">
							Match History
							<RiGamepadLine />
						</div>
						</th>
					</tr>
				</thead>
				<tbody>
					{SMH.map((match, index) => (
						<tr
							key={match.id}
							className={`${"font-medium "} ${match.winner === "draw"
								? "bg-[#303030]/80"
								: match.winner === currentAccount?.username 
								? "bg-[linear-gradient(to_bottom_right,_#2c8a3950_0%,_#20602f90_30%,_#0f402470_70%,_#1f4b2837_100%)]"
								: "bg-[linear-gradient(to_bottom_right,_#e02e2e50_0%,_#aa202090_30%,_#8b131370_70%,_#8b131337_100%)]"}`}
							style={{ height: '75px' }}>
							<td className="w-2/5 text-left pr-2">
								<div className="text-2xl">                     {SMH[index].p1} </div>
								<div className="text-xs italic text-gray-400"> {`${SMH[index].p1Elo} (${SMH[index].p1Diff >= 0 ? `+${SMH[index].p1Diff}` : SMH[index].p1Diff})`} </div>
							</td>

							<td className="w-1/5 text-center">
								<div className="flex flex-col justify-center w-full">
									<span className="text-2xl font-bold">{match.p1score}-{match.p2score}</span>
									<span className="text-xs italic text-gray-400">{format(new Date(match.time), "MM-dd HH:mm")}</span>
								</div>
							</td>
								
							<td className="w-2/5 text-right pl-2">
								<div className="text-2xl">                     {SMH[index].p2} </div>
								<div className="text-xs italic text-gray-400"> {`${SMH[index].p2Elo} (${SMH[index].p2Diff >= 0 ? `+${SMH[index].p2Diff}` : SMH[index].p2Diff})`} </div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function ShowStats()
{
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

	function GetStatEntry(isEven: boolean, startStr: string, unit: string, player: PlayerType, stat: keyof PlayerType): React.ReactElement
	{
		return (
			<tr className={`whitespace-nowrap ${isEven ? "bg-[#303030]/80" : "bg-[#383838]/80"}`}>
				<td className="text-left text-xl font-medium pl-2 pr-12" style={{ height: '75px' }}>
					{startStr}
				</td>
				<td className="text-right p-2">
					<div className="text-3xl font-semibold font-mono" style={{ fontFamily: '"Droid Sans Mono", monospace' }}>{unit === "%" ? toPercentage(player[stat] as number, 0).toString() : player[stat].toString()}{unit}</div>
					<div className="text-xs italic text-gray-400">{getPercentile(player, stat)}</div>
				</td>
			</tr>
		);
	}
	

	const { accounts, loggedInAccounts } = useAccountContext();
	const { indexPlayerStats, showPlayerStats } = useLoginContext();

	const selectedAccount = loggedInAccounts?.[indexPlayerStats];
	const currentAccount = accounts.find(acc => acc.id === selectedAccount?.id) as PlayerType | null;
	if (currentAccount === null)
		return "";

	return (
		<div className="w-full overflow-y-auto border border-base-content/20 bg-transparent">
			<link href="https://fonts.googleapis.com/css2?family=Droid+Sans+Mono:wght@400;500;600&display=swap" rel="stylesheet"></link>
			<table className="table w-full">
				<thead className="bg-black">
					<tr className="text-lg font-light bg-[#303030]/90 text-lightgrey">
						<th className="text-center" colSpan={6}>
						<div className="flex w-full items-center justify-center gap-1">
							Stats
							<IoIosStats />
						</div>
						</th>
					</tr>
				</thead>
				<tbody>
					{GetStatEntry(false, "Rating: ",   "",  currentAccount, 'elo')}
					{GetStatEntry(true,  "Win rate: ", "%", currentAccount, 'winRate')}
					{GetStatEntry(false, "Matches: ",  "",  currentAccount, 'matchesPlayed')}
					{GetStatEntry(true,  "Wins: ",     "",  currentAccount, 'wins')}
					{GetStatEntry(false, "Draws: ",    "",  currentAccount, 'draws')}
					{GetStatEntry(true,  "Losses: ",   "",  currentAccount, 'losses')}
				</tbody>
			</table>
		</div>
	)
}

function PlayerStats({ setShowStats }: {setShowStats: React.Dispatch<React.SetStateAction<boolean>>})
{
	const { accounts, loggedInAccounts } = useAccountContext();
	const { indexPlayerStats } = useLoginContext();

	const selectedAccount = loggedInAccounts?.[indexPlayerStats];
	const currentAccount = accounts.find(acc => acc.id === selectedAccount?.id) as PlayerType | null;
	if (currentAccount === null)
		return "";

	return (
		<AnimatePresence>
			<motion.div
				className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 bg-[#1a1a1a]/90"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}>
				<motion.div
					className="flex flex-col items-center bg-[#2a2a2a]/90 backdrop-blur-md text-white p-8 gap-8 rounded-xl relative shadow-xl w-[50vw] min-w-3xl"
					initial={{ scale: 0.9, y: 20 }}
					animate={{ scale: 1, y: 0 }}
					exit={{ scale: 0.9, y: 20 }}
					transition={{ type: "spring", stiffness: 300, damping: 25 }}>

					<button
						className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer"
						onClick={() => setShowStats(false)}>
						<IoMdClose size={24} />
					</button>

					<div className="flex w-full flex-col items-center gap-2">
						<h2 className="text-2xl font-bold text-center">{currentAccount?.username}</h2>
						<img src={Player} className="h-16 w-16 rounded-full object-cover shadow-2xl"/>
					</div>

					<div className="flex justify-center w-full">
						<div className="w-1/2">
							<ShowStats />
						</div>

						<div className="w-1/2">
							<ShowMatchHistory />
						</div>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}

export default PlayerStats
