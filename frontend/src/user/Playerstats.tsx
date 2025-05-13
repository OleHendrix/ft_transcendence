import { useAccountContext } from "../contexts/AccountContext";
import { useChatContext } from "../contexts/ChatContext";
import { useState, useEffect, useMemo, use } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdClose, IoIosStats } from "react-icons/io";
import { RiGamepadLine } from "react-icons/ri";
import Player from "../../assets/Player.svg";
import { MatchHistory, PlayerType } from "../types";
import { HiUserAdd } from "react-icons/hi";
import { FaUserCheck } from "react-icons/fa";
import { toPercentage } from "../Leaderboard";
import { format } from 'date-fns';
import OnlineStatus from "../utils/OnlineStatus";
import ModalWrapper from "../utils/ModalWrapper";
import axios from "axios";

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);
import { Line } from 'react-chartjs-2';

import { API_URL } from '../utils/network';

function ShowHistoryGraph({matchHistory, selectedAccount} : {matchHistory: MatchHistory[], selectedAccount: PlayerType})
{
	let history: number[] = [];
	let labels:  number[] = [];

	let i = matchHistory.length - 15;
	if (i < 0) {
		i = 0;
	}

	for (; i < matchHistory.length; i++) {
		history.push(matchHistory[i].p1Elo);
		labels.push(i);
	}
	history.push(selectedAccount.elo);
	labels.push(i);

	const data = {
		labels: labels,
		datasets: [
			{
				label: 'ELO',
				data: history,
				borderColor: '#AAAAAAFF',
				borderWidth: 3,
				pointRadius: 2.5,
				pointHoverRadius: 3.5,
				pointBorderWidth: 5,
				pointHoverBorderWidth: 5,
				pointHitRadius: 20,
				fill: false,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
		},
		scales: {
			y: {
				beginAtZero: false,
			},
		},
	};

	return (
		<div className="border border-base-content/20">
			<div className="text-lg font-bold text-grey-700 bg-[#303030]/90 text-center py-2">
				ELO Graph {/*values are always off somehow D:*/}
			</div>
			<div className="h-230px px-2 pt-1">
				<Line data={data} options={options} />
			</div>
		</div>
	)
}

function ShowMatchHistory({sorted} : {sorted: MatchHistory[]})
{
	return (
		<div className="border border-base-content/20 bg-transparent md:h-[486px] md:overflow-y-auto">
			<table className="w-full table overflow-y-auto whitespace-nowrap">
				<thead className="md:sticky md:top-0 z-10 bg-black shadow-2xl">
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
					{sorted.map((match, index) => (
						<tr
							key={match.id}
							className={`${"h-18 font-medium "} ${match.winner === "Draw"
								? "bg-[linear-gradient(to_bottom_right,_#40404050_0%,_#47474790_30%,_#40404070_70%,_#33333337_100%)]"
								: match.winner === match.p1 
								? "bg-[linear-gradient(to_bottom_right,_#2c8a3950_0%,_#20602f90_30%,_#0f402470_70%,_#1f4b2837_100%)]"
								: "bg-[linear-gradient(to_bottom_right,_#e02e2e50_0%,_#aa202090_30%,_#8b131370_70%,_#8b131337_100%)]"}`}>
							<td className="w-2/5 text-left pr-2">
								<div className="text-2xl">                     {sorted[index].p1} </div>
								<div className="text-xs italic text-gray-400"> {`${sorted[index].p1Elo} (${sorted[index].p1Diff >= 0 ? `+${sorted[index].p1Diff}` : sorted[index].p1Diff})`} </div>
							</td>

							<td className="w-1/5 text-center">
								<div className="flex flex-col justify-center w-full">
									<span className="text-2xl font-bold">{match.p1Score}-{match.p2Score}</span>
									<span className="text-xs italic text-gray-400">{format(new Date(match.time), "MM-dd HH:mm")}</span>
								</div>
							</td>
								
							<td className="w-2/5 text-right pl-2">
								<div className="text-2xl">                     {sorted[index].p2} </div>
								<div className="text-xs italic text-gray-400"> {`${sorted[index].p2Elo} (${sorted[index].p2Diff >= 0 ? `+${sorted[index].p2Diff}` : sorted[index].p2Diff})`} </div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function getPercentile(player: PlayerType, stat: keyof PlayerType, accounts: PlayerType[]): string
{
	function calcWorseThan(player: PlayerType, stat: keyof PlayerType, accountsList: PlayerType[]): [number, number]
	{
		let worseThan = 0;
		let total = 0;
		
		for (const account of accountsList)
		{
			if (account.id === player.id || account[stat] === null)
				continue;
			if (account[stat] > player[stat])
				worseThan++;
			total++;
		}
		return [worseThan, total];
	}

	if (player[stat] === null)
		return "Play a match to see ranking";
	const [worseThan, total] = calcWorseThan(player, stat, accounts);
	const percentile = toPercentage((worseThan / total) * 100, 1);
	return `Top ${percentile}% - #${worseThan + 1}`
}

function ShowStats({selectedAccount} : {selectedAccount: PlayerType})
{
	const { accounts } = useAccountContext();

	function GetStatEntry(isEven: boolean, startStr: string, unit: string, player: PlayerType, stat: keyof PlayerType): React.ReactElement
	{
		return (
			<tr className={`h-18 whitespace-nowrap ${isEven ? "bg-[#303030]/80" : "bg-[#383838]/80"}`}>
				<td className="text-left text-xl font-medium pl-2 pr-6">
					{startStr}
				</td>
				<td className="text-right p-2">
					<div className="text-3xl font-semibold font-mono" style={{ fontFamily: '"Droid Sans Mono", monospace' }}>{unit === "%" ? toPercentage(player[stat] as number, 0).toString() : player[stat].toString()}{unit}</div>
					<div className="text-xs italic text-gray-400">{getPercentile(player, stat, accounts)}</div>
				</td>
			</tr>
		);
	}

	return (
		<div className="w-full border border-base-content/20 bg-transparent">
			<link href="https://fonts.googleapis.com/css2?family=Droid+Sans+Mono:wght@400;500;600&display=swap" rel="stylesheet"></link>
			<table className="table w-full table-auto">
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
					{GetStatEntry(false, "Rating: ",   "",  selectedAccount, 'elo')}
					{GetStatEntry(true,  "Win rate: ", "%", selectedAccount, 'winRate')}
					{GetStatEntry(false, "Matches: ",  "",  selectedAccount, 'matchesPlayed')}
					{GetStatEntry(true,  "Wins: ",     "",  selectedAccount, 'wins')}
					{GetStatEntry(false, "Draws: ",    "",  selectedAccount, 'draws')}
					{GetStatEntry(true,  "Losses: ",   "",  selectedAccount, 'losses')}
				</tbody>
			</table>
		</div>
	)
}

function PlayerStats()
{
	const { accounts, loggedInAccounts } = useAccountContext();
	const { setIsOpen, setReceiverId } = useChatContext();
	const [ selectedAccount, setSelectedAccount ] = useState<PlayerType>();
	const [ friendStatus, setFriendStatus ] = useState(false);
	const [ playerRank, setPlayerRank] = useState(0)
	const { username } = useParams();
	const navigate = useNavigate();

	useEffect(() =>
	{
		if (!username || !loggedInAccounts.length)
			return ;
		async function getAccount()
		{
			try
			{
				const response = await axios.get(`${API_URL}/api/get-account`,
					{
						params:
						{
							requestedUser: loggedInAccounts[0].id,
							username: username,
						}
					})
				if (response.data.success)
				{
					setSelectedAccount(response.data.user);
					setPlayerRank(Number(getPercentile(response.data.user, "elo", accounts).split(" ")[3].slice(1, 2)))
					setFriendStatus(response.data.friendshipStatus);
				}
			}
			catch (error: any)
			{
				console.log(error.response)
			}
		}; getAccount()
	}, [loggedInAccounts])

	if (!loggedInAccounts.length)
		return <div className="text-white text-center mt-10">Loading account...</div>; // Bij refresh heeft loggedincaccounts tijd nodig om te fetchen.

	async function sendFriendRequest()
	{
		try
		{
			const response = await axios.post(`${API_URL}/api/send-friendship`,
				{
					requesterId: loggedInAccounts[0].id,
					receiverId: selectedAccount?.id
				})
				if (response.data.success)
				{
					navigate('/');
					setIsOpen(true);
					if (selectedAccount)
						setReceiverId(selectedAccount.id);
				}
		}
		catch (error: any)
		{
			console.log(error.response)
		}
	}
	const matchHistory = selectedAccount?.matches ?? [];
	const sortedMatchHistory = [...matchHistory].sort((a, b) => b.id - a.id);

	return (
		<ModalWrapper>
			<motion.div
				className="flex flex-col items-center bg-[#2a2a2a]/90 backdrop-blur-md text-white p-4 md:p-8 gap-4 md:gap-8 
					w-full max-w-xl md:max-w-2xl mx-2 md:mx-8 lg:mx-16 
					h-[90vh] md:h-auto md:max-h-[85vh] overflow-y-auto
					rounded-xl relative shadow-2xl border border-[#383838]"
				initial={{ scale: 0.9, y: 20 }}
				animate={{ scale: 1, y: 0 }}
				exit={{ scale: 0.9, y: 20 }}
				transition={{ type: "spring", stiffness: 300, damping: 25 }}>
				
				<button
					className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer"
					onClick={() => navigate(-1)}>
					<IoMdClose size={24} />
				</button>

				<div className="flex w-full flex-col items-center gap-2">
					<h2 className="text-2xl font-bold text-center">{selectedAccount?.username}</h2>
						<div className="relative">
						<img src={selectedAccount?.avatar !== '' ? selectedAccount?.avatar : Player} className="h-16 w-16 rounded-full object-cover shadow-2xl"/>
						{selectedAccount?.avatar && <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black to-transparent opacity-70"></div>}
						{!friendStatus  && loggedInAccounts[0].username !== username &&
						(
							<motion.div className="absolute bottom-0 right-0 bg-[#2a2a2a] p-1 rounded-full cursor-pointer hover:bg-[#3a3a3a] transition-colors" whileHover={ {scale: 1.10}}
								onClick={() => sendFriendRequest()}>
								<HiUserAdd size={16} className="text-[#ff914d]" />
							</motion.div>
						)}
						{friendStatus && loggedInAccounts[0].username !== username &&
						(
							<div className="absolute bottom-0 right-0 bg-[#2a2a2a] p-1 rounded-full">
								<FaUserCheck size={16} className="text-green-800" />
							</div>
						)}
						</div>
					{selectedAccount?.online &&
					(
						<div className="flex justify-center items-baseline gap-2">
							<h1>Online</h1>
							<OnlineStatus />
						</div>
					)}
					<div className="flex flex-col p-2 items-center text-white">
						<div className="flex flex-col justify-center items-center">
							<p className="font-light text-s">Rank:</p>
							<h2 className="font-semibold text-3xl font-mono" style={{ fontFamily: '"Droid Sans Mon0o", monospace' }}>{"#" + playerRank}</h2>
						</div>
					</div>
				</div>
				<div className="flex flex-col w-full gap-3">
					<div className="flex flex-col md:flex-row justify-center w-full gap-3 h-full">
						<div className="w-full md:w-2/5 flex-shrink-0">
							{selectedAccount && <ShowStats selectedAccount={selectedAccount as PlayerType}/>}
						</div>

						<div className="w-full md:w-3/5 flex-grow">
							{selectedAccount && <ShowMatchHistory sorted={sortedMatchHistory as MatchHistory[]}/>}
						</div>
					</div>

					{selectedAccount && <ShowHistoryGraph matchHistory={matchHistory as MatchHistory[]} selectedAccount={selectedAccount as PlayerType}/>}
				</div>
			</motion.div>
		</ModalWrapper>
	);
}

export default PlayerStats
