import { useEffect, useState } 		from 'react';
import { useNavigate } 				from 'react-router-dom';
import { motion, AnimatePresence } 	from 'framer-motion';
import { IoMdClose } 				from 'react-icons/io';
import { useTournamentContext } 	from '../contexts/TournamentContext';
import axios 						from 'axios';

interface TournamentLobby {
	tournamentId: 	number;
	hostUsername: 	string;
	currentPlayers: number;
	maxPlayers: 	number;
}

export default function TournamentLobbyList() {
	const { setTournamentId } 		= useTournamentContext();
	const [ lobbies, setLobbies ] 	= useState<TournamentLobby[]>([]);
	const navigate 					= useNavigate();

	useEffect(() => {
		fetchLobbies();
	}, []);

	async function fetchLobbies() {
		try {
			const response = await axios.get(`http://${window.location.hostname}:5001/api/get-tournament-lobbies`);
			setLobbies(response.data);
		} catch (error: any) {
			console.log(error);
		}
	}

	async function joinTournament(tournamentId: number)
	{
		setTournamentId(tournamentId);
		navigate('/tournament/waiting-room');
	}
	return (
		<AnimatePresence>
			<motion.div
				className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 bg-[#1a1a1a]/90"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
			>
				<motion.div
					className="flex flex-col bg-[#2a2a2a]/90 text-white p-8 gap-6 rounded-lg w-full min-w-[400px] min-h-[500px] max-w-xl max-h-[600px] relative shadow-xl overflow-hidden"
					initial={{ scale: 0.9, y: 20 }}
					animate={{ scale: 1, y: 0 }}
					exit={{ scale: 0.9, y: 20 }}
					transition={{ type: 'spring', stiffness: 300, damping: 25 }}
				>
					{/* Close button */}
					<button
						className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer"
						onClick={() => navigate(-1)}
					>
						<IoMdClose size={24} />
					</button>

					<h1 className="text-2xl font-bold text-center">Tournament Lobbies</h1>

					<div className="flex flex-col gap-4 overflow-y-auto px-2 pr-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
						{lobbies.length === 0 ? (
							<p className="text-center text-gray-400">No lobbies available</p>
						) : (
							lobbies.map((lobby) => (
								<div
									key={lobby.tournamentId}
									className="bg-[#1f1f1f] p-4 rounded-xl shadow-md flex justify-between items-center"
								>
									<div className="flex flex-col">
										<span className="text-lg font-semibold">{lobby.hostUsername}'s Lobby</span>
										<span className="text-sm text-gray-400">
											{lobby.currentPlayers} / {lobby.maxPlayers} players
										</span>
									</div>
									<button className="bg-[#134588] px-4 py-1 rounded-3xl text-white text-sm hover:bg-[#1960bd]"
										onClick={() => joinTournament(lobby.tournamentId)}
									>
										Join
									</button>
								</div>
							))
						)}
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
