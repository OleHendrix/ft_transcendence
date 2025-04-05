import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PlayerType } from './types';
import axios from 'axios';
import { useAccountContext } from './contexts/AccountContext';
import { IoMdClose } from 'react-icons/io';

export default function Leaderboard ()
{
	const { accounts, setShowLeaderboard } = useAccountContext();
	const [ sortedAccounts, setSortedAccounts ] = useState<PlayerType[]>([]);

	useEffect(() =>
	{
		setSortedAccounts(accounts.sort((a, b) => b.elo - a.elo));
	}, []);

	return (
		<AnimatePresence>
			<motion.div 
				className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 bg-[#1a1a1a]/90"
				initial={{ opacity: 0 }} 
				animate={{ opacity: 1 }} 
				exit={{ opacity: 0 }}
			>
				<motion.div 
					className="flex flex-col items-center bg-[#2a2a2a]/90 text-white p-8 gap-8 rounded-lg w-full min-w-[400px] min-h-[500px] max-w-xl max-h-[600px] relative shadow-xl"
					initial={{ scale: 0.9, y: 20 }} 
					animate={{ scale: 1, y: 0 }} 
					exit={{ scale: 0.9, y: 20 }} 
					transition={{ type: "spring", stiffness: 300, damping: 25 }}
				>
					<h1 className="justify-center text-xl font-black">Leaderboard</h1>
					<button 
						className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer"
						onClick={() => setShowLeaderboard(false)}
					>
						<IoMdClose size={24} />
					</button>
	
					<div className="w-full h-80 overflow-y-auto rounded-lg border border-base-content/5 bg-transparent">
						<table className="table w-full">
							<thead>
								<tr className="bg-[#3a3a3a]/90 text-white">
									<th>#</th>
									<th>Name</th>
									<th>ELO</th>
								</tr>
							</thead>
							<tbody>
								{sortedAccounts.map((account, index) => (
									<tr 
										key={account.id} 
										className={index % 2 === 0 ? "bg-[#3a3a3a]/80" : "bg-[#454545]/80"}
									>
										<th>{index + 1}</th>
										<td>{account.username}</td>
										<td>{account.elo}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
	
};