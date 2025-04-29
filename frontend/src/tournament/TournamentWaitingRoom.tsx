import { useState } 						from 'react';
import axios 								from 'axios';
import { motion, AnimatePresence } 			from 'framer-motion';
import { useNavigate } 						from 'react-router-dom';
import { IoMdClose } 						from 'react-icons/io';
import { useTournamentContext } 			from '../contexts/TournamentContext';
import { PlayerData }						from '../types';
import { useAccountContext } 				from '../contexts/AccountContext';
import { localStorageUpdateTournamentId } 	from './utils';

export default function TournamentWaitingRoom() {
	const { loggedInAccounts } 											= useAccountContext();
	const { setTournamentId, setReadyForNextRound }						= useTournamentContext();
	const { tournamentId, tournamentData, players, readyForNextRound } 	= useTournamentContext();
	const [ isLeaving, setIsLeaving ] 									= useState(false);
	const navigate 														= useNavigate();

	const handleClose = async () => {
		if (isLeaving) return; //protection agains double clicks
		if (!tournamentData) return console.warn("TournamentWaitingRoom:handleClose:TournamentData_not_ready_yet"); //misschien onnodig?

		setIsLeaving(true);
		try {
			if (loggedInAccounts[0].id === tournamentData?.hostId && tournamentData.players.length > 1){
				await axios.post(`http://${window.location.hostname}:5001/api/rehost-tournament`, {tournamentId })
			}
			await axios.post(`http://${window.location.hostname}:5001/api/leave-tournament`, { playerId: loggedInAccounts[0].id, tournamentId, });

			setTournamentId(-1);
			localStorageUpdateTournamentId(-1);
			navigate('/');

		} catch (error) {
			console.log(error);
		} finally {
			setIsLeaving(false);
		}
	};

	function generateBracket(players: PlayerData[], maxPlayers: number) {
		const totalRounds = Math.log2(maxPlayers);
		const rounds: string[][] = [];

		let currentRound: string[] = [];
		for (let i = 0; i < maxPlayers; i += 2) {
			const p1 = players[i]?.username || `TBD`;
			const p2 = players[i + 1]?.username || `TBD`;
			currentRound.push(`${p1} vs ${p2}`);
		}
		rounds.push(currentRound);

		for (let r = 1; r < totalRounds; r++) {
			const matchesInRound = maxPlayers / Math.pow(2, r + 1);
			const nextRound = Array.from({ length: matchesInRound }, (_, i) => `Winner ${i * 2 + 1} vs Winner ${i * 2 + 2}`);
			rounds.push(nextRound);
		}
		return rounds;
	}

	const rounds = tournamentData ? generateBracket(players, tournamentData.maxPlayers) : [];

	return (
		<motion.div
			className="absolute top-[8vh] w-screen h-[calc(100vh-8vh)] backdrop-blur-md bg-black/60 flex items-center justify-center z-50"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
		>
			<motion.div
				className="relative bg-[#1e1e1e]/90 text-white rounded-2xl shadow-2xl p-10 w-[90vw] max-w-5xl h-[90vh] overflow-hidden flex flex-col"
				initial={{ scale: 0.95, y: 20 }}
				animate={{ scale: 1, y: 0 }}
				exit={{ scale: 0.95, y: 20 }}
				transition={{ type: "spring", stiffness: 300, damping: 25 }}
			>
				{/* Close Button */}
				<button
					className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
					onClick={handleClose}
					disabled={isLeaving}
				>
					<IoMdClose size={28} />
				</button>

				{/* Title */}
				<h1 className="text-3xl font-bold mb-6 text-center uppercase tracking-wide">
					Tournament Waiting Room
				</h1>

				{/* Host Info */}
				{tournamentData && (
					<div className="flex justify-center gap-10 mb-6 text-lg font-medium text-gray-300">
						<p>🎯 Host: <span className="text-white">{tournamentData.hostUsername}</span></p>
						<p>👥 Players: <span className="text-white">{players.length}/{tournamentData.maxPlayers}</span></p>
					</div>
				)}

				{/* Players List */}
				<div className="flex-1 overflow-auto px-4">
					<h2 className="text-2xl font-semibold mb-4">Players in Lobby</h2>
					<ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
						{players.length > 0 ? (
							players.map((player: PlayerData, index: number) => (
								<li
									key={index}
									className="bg-gray-700/80 rounded-xl p-3 text-center text-white font-medium shadow-md"
								>
									👤 {player.username}
								</li>
							))
						) : (
							<li className="text-gray-400">No players yet...</li>
						)}
					</ul>
				</div>

				{/* Host Controls */}
				<div className="mt-6 flex justify-center gap-6 flex-wrap">
					{tournamentData &&
						loggedInAccounts[0]?.username === tournamentData.hostUsername &&
						players.length === tournamentData.maxPlayers && (
							<button
								onClick={async () => {
									try {
										await axios.post(`http://${window.location.hostname}:5001/api/start-tournament`, { tournamentId });
									} catch (error) {
										console.error('tournamentWaitingRoom:ON_CLICK:start-tournament:ERROR:', error);
									}
								}}
								className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-semibold rounded-xl shadow-lg transition"
							>
								Start Tournament
							</button>
						)}

					{tournamentData &&
						loggedInAccounts[0]?.username === tournamentData.hostUsername &&
						readyForNextRound && (
							<button
								onClick={async () => {
									try {
										await axios.post(`http://${window.location.hostname}:5001/api/start-next-round`, { tournamentId });
										setReadyForNextRound(false);
									} catch (error) {
										console.error('tournamentWaitingRoom:ON_CLICK:start-next-round:ERROR:', error);
									}
								}}
								className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition"
							>
								Start Next Round
							</button>
						)}
				</div>

				{/* Bracket View */}
				{rounds.length > 0 && (
					<div className="flex-1 flex items-center justify-center mt-8 overflow-auto">
						<div className="flex flex-col items-center w-full">
							<h2 className="text-2xl font-semibold mb-6 text-center">Bracket</h2>
							<div className="flex gap-6 justify-start items-center w-fit px-4">
								{rounds.map((round, roundIndex) => (
									<div key={roundIndex} className="flex flex-col gap-6 min-w-[200px]">
										{round.map((match, matchIndex) => (
											<div
												key={matchIndex}
												className="bg-gray-800 text-white px-4 py-2 rounded-xl text-center shadow"
											>
												{match}
											</div>
										))}
									</div>
								))}
							</div>
						</div>
					</div>
				)}
			</motion.div>
		</motion.div>
	);
}
