import { motion } 								from 'framer-motion';
import { useNavigate } 							from 'react-router-dom';
import { useAccountContext } 					from '../contexts/AccountContext';
import { useEffect, useState } 							from 'react';
import ModalWrapper 							from "../utils/ModalWrapper";
import { TournamentLobby } 						from '../types';
import { createTournament } 	from './utilsFunctions';
import CloseButton 								from '../utils/CloseButton';
import { StyledButton } 						from '../user/utilsComponents';
const API_URL = import.meta.env.VITE_API_URL;
import axios from 'axios';

export default function TournamentMenu()
{
	const { loggedInAccounts } 		= useAccountContext();
	const [ lobbies, setLobbies ] 	= useState<TournamentLobby[]>([]);
	const navigate					= useNavigate();
	
	useEffect(() =>
	{
		const fetchLobbies = async () =>
		{
			const response = await axios.get(`${API_URL}/api/get-tournament-lobbies`);
			setLobbies(response.data);
		};
		fetchLobbies();
		const interval = setInterval(fetchLobbies, 1000);
		return () => clearInterval(interval);
	}, []);
	

	return (
		<ModalWrapper>
			<motion.div
				className="flex flex-col bg-zinc-800 text-white p-8 gap-6 rounded-2xl w-full max-w-2xl min-h-[600px] shadow-2xl relative"
				initial={{ scale: 0.95, y: 30 }}
				animate={{ scale: 1, y: 0 }}
				exit={{ scale: 0.95, y: 30 }}
				transition={{ type: "spring", stiffness: 250, damping: 25 }}>
				<CloseButton onClick={() => navigate('/')}/>
				<h1 className="text-3xl font-extrabold text-center">Tournament Menu</h1>
				<section className="flex flex-col gap-4">
					<h2 className="text-xl font-bold">Create a Tournament</h2>
					<div className="flex gap-4">
						{[4, 8, 16].map((count) =>
							<StyledButton
								key={count}
								onClick={() => createTournament({ maxPlayers: count, loggedInAccounts, navigate })}   	//Maakt een tournament aan met een random id
								variant="secondary"																		//Daarna navigeert naar /waiting-room/{id} (Eerst door Tournamentprotection)
								text={`${count} Players`}/>																//Er wordt nog NIET gejoined!!, door de host
						)}
					</div>
				</section>

				<section className="flex flex-col gap-3 mt-6 flex-grow">
					<h2 className="text-xl font-bold">Join a Lobby</h2>
					<div className="flex flex-col gap-3 overflow-y-auto max-h-64 pr-2 scrollbar-thin scrollbar-thumb-[#444] scrollbar-track-transparent">
						{lobbies.length === 0 ?
						(
							<p className="text-gray-400 text-center py-8">No lobbies available right now.</p>
						) :
						(
							lobbies.map((lobby) =>
							(
								<motion.div
									key={lobby.tournamentId}
									className="bg-[#2a2a2a] p-4 rounded-xl shadow hover:shadow-lg transition flex justify-between items-center"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.2 }}>
									<div className="flex flex-col">
										<span className="text-lg font-semibold">
											{lobby.hostUsername}'s Lobby
										</span>
										<span className="text-sm text-gray-400">
											{lobby.currentPlayers} / {lobby.maxPlayers} players
										</span>
									</div>
									{lobby.currentPlayers < lobby.maxPlayers ?
									(
										<button
											className="bg-[#ff914d] hover:bg-[#ab5a28] px-4 py-1 rounded-full font-semibold text-sm"
											onClick={() => navigate(`/tournament/waiting-room/${lobby.tournamentId}`)}>	{/*Navigeert naar waiting room, nog NIET gejoined (Eerst door Tournamentprotection)*/}
											Join
										</button>
									) :
									(
										<button
											className="bg-[#134588] px-4 py-1 rounded-full font-semibold text-sm opacity-30"
											disabled={true}>
											Full
										</button>
									)}
								</motion.div>
							))
						)}
					</div>
				</section>
			</motion.div>
		</ModalWrapper>
	);
}

