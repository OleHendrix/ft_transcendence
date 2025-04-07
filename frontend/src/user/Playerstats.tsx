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
	const SMD = [...matchHistory].sort((a, b) => b.id - a.id); //shortenedMatchHistory

	console.log(matchHistory);
	console.log("Accounts:", accounts);
	console.log("LoggedIn:", loggedInAccounts);
	return (
		<div className="w-full h-117 overflow-y-auto border border-base-content/5 bg-transparent">
			<div className="overflow-x-auto max-w-full">  {/* Add this wrapper div */}
				<table className="table w-full max-w-full text-center">
					<thead>
						<tr className="text-lg font-light bg-[#303030]/90 text-lightgrey">
							<th className="w-100 text-center" colSpan={6}>Match History</th>
						</tr>
					</thead>
					<tbody>
						{SMD.map((match, index) => (
							<tr
								key={match.id}
								// TODO: add support for ties
								className={`${"font-medium "} ${match.winner === match.p1
									? "bg-[linear-gradient(to_bottom_right,_#2c8a3950_0%,_#20602f90_30%,_#0f402470_70%,_#1f4b2837_100%)]"
									: "bg-[linear-gradient(to_bottom_right,_#e02e2e50_0%,_#aa202090_30%,_#8b131370_70%,_#8b131337_100%)]"}`}
								style={{ height: '69px' }}
							>
								<td className="text-left text-2xl pl-3">     		   		{SMD[index].p1}</td>
								<td className="italic text-gray-300 text-xs pr-4">			{`${SMD[index].p1Elo} (${SMD[index].p1Diff >= 0 ? `+${SMD[index].p1Diff}` : SMD[index].p1Diff})`}</td>
								<td className="text-center text-2xl font-bold flex-grow">	{SMD[index].p1score}-{SMD[index].p2score}</td>
								<td className="italic text-gray-300 text-xs pl-4">			{`${SMD[index].p2Elo} (${SMD[index].p2Diff >= 0 ? `+${SMD[index].p2Diff}` : SMD[index].p1Diff})`}</td>
								<td className="text-right text-2xl pr-3">     				{SMD[index].p2}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
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
			<tr className={`${isEven ? "bg-[#303030]/80" : "bg-[#383838]/80"}`}>
				<td className="text-left text-2xl font-medium pl-2" style={{ height: '45px' }}>
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

	const currentAccount = accounts[loggedInAccounts[indexPlayerStats].id - 2];
	if (currentAccount === null)
		return;

	return (
		<div className="w-full overflow-y-auto border border-base-content/5 bg-transparent">
			<link href="https://fonts.googleapis.com/css2?family=Droid+Sans+Mono:wght@400;500;600&display=swap" rel="stylesheet"></link>
			<table className="table w-full">
				<thead>
					<tr className="text-lg font-light bg-[#303030]/90 text-lightgrey">
						<th className="w-100 text-center" colSpan={6}>Stats</th>
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

function StatWindow()
{
	const { accounts, loggedInAccounts } = useAccountContext();
	const { indexPlayerStats, showPlayerStats } = useLoginContext();
	const [ index, setIndex ]  = useState(-1);
	const [profileImage, setProfileImage] = useState(Player);
	const [ showStats, setShowStats ] = useState(false);

	const currentAccount = accounts[loggedInAccounts[indexPlayerStats].id - 2];
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
					className="flex-col items-center bg-[#2a2a2a]/90 backdrop-blur-md text-white p-8 gap-8 rounded-xl w-full min-w-[800px] max-w-[1200px] min-h-[700px] max-w-xl max-h-[700px] relative shadow-2xl"
					initial={{ scale: 0.9, y: 20 }}
					animate={{ scale: 1, y: 0 }}
					exit={{ scale: 0.9, y: 20 }}
					transition={{ type: "spring", stiffness: 300, damping: 25 }}
				>
					{/* // TODO: unfuck exit button */}
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
						<div className="w-7/20">
							<ShowStats />
						</div>
							
						<div className="w-13/20">
							<ShowMatchHistory />
						</div>
					</main>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
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
}

export default PlayerStats
