import { motion, AnimatePresence } 	from 'framer-motion';
import { Link, useNavigate } 		from 'react-router-dom';
import { useAccountContext } 		from '../contexts/AccountContext';
import { IoMdClose } 				from 'react-icons/io';
import axios 						from 'axios';
import { useTournamentContext } 	from '../contexts/TournamentContext';
import { useEffect, useState } 		from 'react';
import ModalWrapper 				from "../utils/ModalWrapper";

interface TournamentLobby {
	tournamentId: 	number;
	hostUsername: 	string;
	currentPlayers: number;
	maxPlayers: 	number;
}

export default function TournamentMenu() {
	const { loggedInAccounts } 		= useAccountContext();
	const { setTournamentId, } 		= useTournamentContext();
	const [ lobbies, setLobbies ] 	= useState<TournamentLobby[]>([]);
	const navigate					= useNavigate();

	async function createTournament( maxPlayers: number )
	{
		try {
			const host = { id: loggedInAccounts[0].id, username: loggedInAccounts[0].username };
			const response = await axios.post(`http://${window.location.hostname}:5001/api/create-tournament`, {
				hostId: host.id,
				hostUsername: host.username,
				maxPlayers,
			});
			setTournamentId(response.data.tournamentId);
			navigate('/tournament/waiting-room');
		} catch (error) {
			console.log(error);
		}
	}

	async function joinTournament(tournamentId: number)
	{
		setTournamentId(tournamentId);
		navigate('/tournament/waiting-room');
	}

	useEffect(() => {
		fetchLobbies();
	}, [lobbies]);

	async function fetchLobbies() {
		try {
			const response = await axios.get(`http://${window.location.hostname}:5001/api/get-tournament-lobbies`);
			setLobbies(response.data);
		} catch (error: any) {
			console.log(error);
		}
	}

	
	return (
		<ModalWrapper className='bg-black/60'>
			<motion.div
				className="flex flex-col bg-[#1e1e1e] text-white p-8 gap-6 rounded-2xl w-full max-w-2xl min-h-[600px] shadow-2xl relative"
				initial={{ scale: 0.95, y: 30 }}
				animate={{ scale: 1, y: 0 }}
				exit={{ scale: 0.95, y: 30 }}
				transition={{ type: "spring", stiffness: 250, damping: 25 }}
			>
				{/* Close Button */}
				<button
					className="absolute top-4 right-4 text-gray-400 hover:text-white"
					onClick={() => navigate('/')}
				>
					<IoMdClose size={28} />
				</button>

				{/* Title */}
				<h1 className="text-3xl font-extrabold text-center">Tournament Menu</h1>

				{/* Create Tournament */}
				<section className="flex flex-col gap-4">
					<h2 className="text-xl font-bold">Create a Tournament</h2>
					<div className="flex gap-4 flex-wrap">
						{[4, 8, 16, 32].map((count) => (
							<motion.button
								key={count}
								className="flex-1 min-w-[90px] py-2 bg-[#134588] hover:bg-[#1960bd] rounded-full text-sm font-semibold transition"
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => createTournament(count)}
							>
								{count} Players
							</motion.button>
						))}
					</div>
				</section>

				{/* Lobby List */}
				<section className="flex flex-col gap-3 mt-6 flex-grow">
					<h2 className="text-xl font-bold">Join a Lobby</h2>
					<div className="flex flex-col gap-3 overflow-y-auto max-h-64 pr-2 scrollbar-thin scrollbar-thumb-[#444] scrollbar-track-transparent">
						{lobbies.length === 0 ? (
							<p className="text-gray-400 text-center py-8">No lobbies available right now.</p>
						) : (
							lobbies.map((lobby) => (
								<motion.div
									key={lobby.tournamentId}
									className="bg-[#2a2a2a] p-4 rounded-xl shadow hover:shadow-lg transition flex justify-between items-center"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.2 }}
								>
									<div className="flex flex-col">
										<span className="text-lg font-semibold">
											{lobby.hostUsername}'s Lobby
										</span>
										<span className="text-sm text-gray-400">
											{lobby.currentPlayers} / {lobby.maxPlayers} players
										</span>
									</div>
									<button
										className="bg-[#ff914d] hover:bg-[#ab5a28] px-4 py-1 rounded-full font-semibold text-sm"
										onClick={() => joinTournament(lobby.tournamentId)}
									>
										Join
									</button>
								</motion.div>
							))
						)}
					</div>
				</section>
			</motion.div>
		</ModalWrapper>
	);
}

