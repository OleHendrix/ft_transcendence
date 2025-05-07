// import { motion, AnimatePresence } from 'framer-motion';
// import { useEffect, useState } from 'react';
// import { PlayerType } from './types';
// import logo from "../assets/Logo.png";
// import SearchBar from './utils/SearchBar';
// import OnlineStatus from './utils/OnlineStatus';
// import { useNavigate, Outlet } from 'react-router-dom';
// import axios from 'axios';
// import { IoMdClose } from 'react-icons/io';
// import { GoTrophy } from "react-icons/go";
// import ModalWrapper from './utils/ModalWrapper';
// const API_URL = import.meta.env.VITE_API_URL;

// export function toPercentage(n: number, decimals: number): number
// {
// 	const factor = Math.pow(10, decimals);
// 	return (Math.floor(n * factor) / factor);
// }

// export default function Leaderboard()
// {
// 	const [ accounts, setAccounts ] = useState<PlayerType[]>([]);
// 	const [ sortedAccounts, setSortedAccounts ] = useState<PlayerType[]>([]);
// 	const [searchInput, setSearchInput] = useState('');
// 	const navigate = useNavigate();

// 	useEffect(() =>
// 	{
// 		async function fetchAccounts()
// 		{
// 			try
// 			{
// 				const response = await axios.get(`${API_URL}/api/get-accounts`);
// 				setAccounts(response.data.accounts);
// 			}
// 			catch (error: any)
// 			{
// 				console.log(error.response.data);
// 			}
// 		} fetchAccounts();
// 	}, [])

// 	useEffect(() => {setSortedAccounts(accounts.sort((a, b) => b.elo - a.elo));}, [accounts]);

// 	return (
// 		<ModalWrapper>
// 			<motion.div
// 				className="flex flex-col items-center bg-[#2a2a2a]/90 text-white gap-8 rounded-lg p-4 md:p-8 w-full max-w-xl md:max-w-3xl mx-4 md:mx-8 lg:mx-16 h-auto max-h-[80vh] relative shadow-xl"
// 				initial={{ opacity: 0 }}
// 				animate={{ opacity: 1 }}
// 				exit={{ opacity: 0 }}>
// 				<motion.div
// 					className="flex flex-col items-center bg-[#2a2a2a]/90 text-white rounded-lg p-4 w-full max-w-xl md:max-w-xl mx-4 md:mx-8 lg:mx-16 h-auto max-h-[80vh] relative shadow-xl"
// 					initial={{ scale: 0.9, y: 20 }}
// 					animate={{ scale: 1, y: 0 }}
// 					exit={{ scale: 0.9, y: 20 }}
// 					transition={{ type: "spring", stiffness: 300, damping: 25 }}>
// 					<div className='flex flex-col items-center font-bold'>
// 						<img src={logo} className='h-16 w-auto'/>
// 					</div>

					
// 					<button
// 						className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer"
// 						onClick={() => navigate('/')}>
// 						<IoMdClose size={24} />
// 					</button>

// 					<div className='flex flex-col w-full max-h-[80vh] overflow-y-auto rounded-lg gap-2'>
// 						<div className='w-full flex justify-end'>
// 							<SearchBar setSearchInput={setSearchInput} backGroundColor={'bg-[#1a1a1a]/20'}/>
// 						</div>

// 						<div className="w-full max-h-[80vh] overflow-y-auto rounded-lg border border-base-content/5 bg-transparent">
// 							<table className="table w-full text-center">
// 								<thead className="sticky top-0 z-10 bg-black shadow-2xl">
// 									<tr className="text-m md:text-lg font-light bg-[#303030]/90 text-lightgrey">
// 										<th className="text-m text-left">#</th>
// 										<th className="text-left">Name</th>
// 										<th>ELO</th>
// 										<th>Wins</th>
// 										<th>Losses</th>
// 										<th>Win Rate</th>
// 									</tr>
// 								</thead>
// 								<tbody>
// 									{sortedAccounts
// 										.filter(account => account.username.toLowerCase().includes(searchInput.toLowerCase()))
// 										.map((account, index) => GetPositionFormatting(account, accounts, index))
// 									}
// 								</tbody>
// 							</table>
// 						</div>
// 					</div>
// 					<Outlet />
// 				</motion.div>
// 			</motion.div>
// 		</ModalWrapper>
// 	);
// }

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PlayerType } from './types';
import logo from "../assets/Logo.png";
import SearchBar from './utils/SearchBar';
import OnlineStatus from './utils/OnlineStatus';
import ModalWrapper from "./utils/ModalWrapper";
import { useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { IoMdClose } from 'react-icons/io';
import { GoTrophy } from "react-icons/go";
import { secureApiCall } from './jwt/secureApiCall';
const API_URL = import.meta.env.VITE_API_URL;


export function toPercentage(n: number, decimals: number): number
{
	const factor = Math.pow(10, decimals);
	return (Math.floor(n * factor) / factor);
}

export default function Leaderboard()
{
	const [ accounts, setAccounts ] = useState<PlayerType[]>([]);
	const [ sortedAccounts, setSortedAccounts ] = useState<PlayerType[]>([]);
	const [searchInput, setSearchInput] = useState('');
	const navigate = useNavigate();

	useEffect(() =>
	{
		async function fetchAccounts()
		{
			try
			{
				const loggedInAccountsRaw = localStorage.getItem('loggedInAccounts');
				if (!loggedInAccountsRaw) return;

				const loggedInAccounts = JSON.parse(loggedInAccountsRaw);
				const userId = loggedInAccounts[0]?.id;
				if (!userId) return;

				const response = await secureApiCall(userId, (accessToken) =>
					 axios.post(`${API_URL}/api/get-accounts`, {},
					{
						headers:
						{
							Authorization: `Bearer ${accessToken}`
						}
					})
				);
				setAccounts(response.data.accounts);
			}
			catch (error: any)
			{
				console.log(error.response.data);
			}
		} fetchAccounts();
	}, [])

	useEffect(() => {setSortedAccounts(accounts.sort((a, b) => b.elo - a.elo));}, [accounts]);

	function getBorderColour(position: number): string {
		let str = "";
		switch (position) { 
			case 1:		str = "bg-gradient-to-r from-[#C88F0B] via-[#E0B320] to-[#F0D000] border-[#C88F0B]"; break;
			case 2:		str = "bg-gradient-to-r from-[#B0B0B0] via-[#D0D0D0] to-[#E0E0E0] border-[#B0B0B0]"; break;
			case 3:		str = "bg-gradient-to-r from-[#B85C00] via-[#DD7500] to-[#E08400] border-[#B85C00]"; break;
			default:	return "";
		}
		return "shadow-xl text-lg border-2 " + str;
	}

	function getRanking(player: PlayerType, accountsList: PlayerType[]): number {
		let ranking = 1

		for (const account of accountsList)
		{
			if (player.id === account.id)
				continue
			if ((player.elo  <  account.elo) ||
				(player.elo === account.elo && player.winRate  <  account.winRate) ||
				(player.elo === account.elo && player.winRate === account.winRate && player.username > account.username))
			{
				ranking++
			}
		}
		return ranking
	}

	function GetPositionFormatting(player: PlayerType, accountsList: PlayerType[], index: number) {
		const position = getRanking(player, accountsList);

		return (
			<tr
			key={player.id}
			className={`text-l font-bold ${
				position === 1 ? "bg-[linear-gradient(to_right,_#FFD70080_0%,_#FFD70032_15%,_#E0B32022_25%,_#F0D00001_100%)]" :
				position === 2 ? "bg-[linear-gradient(to_right,_#C0C0D080_0%,_#C0C0D032_15%,_#C0C0D022_25%,_#C0C0D001_100%)]" :
				position === 3 ? "bg-[linear-gradient(to_right,_#B85C0080_0%,_#B85C0032_15%,_#B85C0022_25%,_#B85C0001_100%)]" :
				index % 2 === 1 ? "bg-[#303030]/80" : "bg-[#383838]/80"}`}>
			<td className="w-6 p-[0.25px]">
				<div className={`w-9 h-9 rounded-md ml-1 flex items-center justify-center 
					${getBorderColour(position)}`}
					style={{ textShadow: '1px 1px 4px rgba(0, 0, 0, 0.5)' }}>
					{position}
				</div>
			</td>
			
			<td className="text-left"><span className='hover:underline cursor-pointer flex items-center gap-1.5' onClick={() => navigate(`./${player.username}`) }>
				{player.username}
				{player.online ? <OnlineStatus />: <div></div>}
			</span></td>
			<td className="w-18">{player.elo}</td>
			<td className="w-18">{player.wins}</td>
			<td className="w-18">{player.losses}</td>
			<td className="w-18">{(player.wins + player.draws + player.losses === 0) ? "-" : toPercentage(player.wins / (player.wins + player.losses) * 100, 1) + '%'}</td>
		</tr>
		)
	}

	// function getBorderColour(position: number): string
	// {
	// 	if (position > 3)
	// 		return "";
	
	// 	let str = "shadow-xl text-lg border-2 ";
	
	// 	switch (position) { 
	// 		case 1: str += "bg-gradient-to-r from-[#C88F0B] via-[#E0B320] to-[#F0D000] border-[#C88F0B]"; break;
	// 		case 2: str += "bg-gradient-to-r from-[#B0B0B0] via-[#D0D0D0] to-[#E0E0E0] border-[#B0B0B0]"; break;
	// 		case 3: str += "bg-gradient-to-r from-[#B85C00] via-[#DD7500] to-[#E08400] border-[#B85C00]"; break;

	// 	}
	// 	return str;
	// }

	return (
		<ModalWrapper>
			<motion.div
				className="flex flex-col items-center bg-[#2a2a2a]/90 text-white gap-8 rounded-lg p-4 md:p-8 w-full max-w-xl md:max-w-xl mx-4 md:mx-8 lg:mx-16 h-auto max-h-[80vh] relative shadow-xl"
				initial={{ scale: 0.9, y: 20 }}
				animate={{ scale: 1, y: 0 }}
				exit={{ scale: 0.9, y: 20 }}
				transition={{ type: "spring", stiffness: 300, damping: 25 }}>
				<div className='flex flex-col items-center font-bold'>
					<img src={logo} className='h-14 w-auto'/>
					<p className='text-2xl'>Top Players</p>
					<GoTrophy size={18} className='text-[#ff914d] mt-2'/>
				</div>

				
				<button
					className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer"
					onClick={() => navigate('/')}>
					<IoMdClose size={24} />
				</button>

				<div className='flex flex-col w-full h-180 overflow-y-auto rounded-lg gap-2'>
				<div className='w-full flex justify-end'>
					<SearchBar setSearchInput={setSearchInput} backGroundColor={'bg-[#1a1a1a]/20'}/>
				</div>

				<div className="w-full h-180 overflow-y-auto rounded-lg border border-base-content/5 bg-transparent">
					<table className="table w-full text-center">
						<thead className="sticky top-0 z-10 bg-black shadow-2xl">
							<tr className="text-m md:text-lg font-light bg-[#303030]/90 text-lightgrey">
								<th className="text-m text-left">#</th>
								<th className="text-left">Name</th>
								<th>ELO</th>
								<th>Wins</th>
								<th>Losses</th>
								<th>Win Rate</th>
							</tr>
						</thead>
						<tbody>
							{sortedAccounts
								.filter(account => account.username.toLowerCase().includes(searchInput.toLowerCase()))
								.map((account, index) => GetPositionFormatting(account, accounts, index))
							}
						</tbody>
					</table>
				</div>
				</div>
				<Outlet />
			</motion.div>
		</ModalWrapper>
	);
}