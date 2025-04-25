import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IoMdClose } from 'react-icons/io';
import axios from 'axios';
import { useTournamentContext } from '../contexts/TournamentContext';
import { PlayerData, Result }			from '../types';
import { useAccountContext } from '../contexts/AccountContext';

//TODO: refresh in tournament waiting room breaks it

export default function TournamentWaitingRoom() {
	const { loggedInAccounts } = useAccountContext();
	const { setTournamentId, tournamentId, tournamentData, players } = useTournamentContext();
	const navigate = useNavigate();

	const handleClose = async () => {
		try {
			console.log(`TournamentWaitingRoom:handleClose:api/leave-tournament:PlayerID:${loggedInAccounts[0].id}:TournamentId:${tournamentId}`);
			await axios.post(`http://${window.location.hostname}:5001/api/leave-tournament`, {
				playerId: loggedInAccounts[0].id,
				tournamentId,
			});
			setTournamentId(-1);
			navigate('/');
		} catch (error) {
			console.log(error);
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

	function readyForNextRound() {
		console.log("Checking if ready for next round...");
	
		if (!tournamentData) {
			console.log("No tournament data.");
			return false;
		}
	
		if (!tournamentData.rounds) {
			console.log("No rounds found in tournamentData.");
			return false;
		}
	
		console.log(`Current roundIdx: ${tournamentData.roundIdx}`);
	
		if (tournamentData.roundIdx === 0) {
			console.log("First round hasn't been completed yet.");
			return false;
		}
	
		const currentRound = tournamentData.rounds[tournamentData.roundIdx - 1];
		if (!currentRound) {
			console.log("No current round found.");
			return false;
		}
	
		console.log("Checking all matches in current round...");
		for (const match of currentRound) {
			console.log(`Match result: ${match.state.result}`);
			if (match.state.result === Result.PLAYING) {
				console.log("At least one match still playing.");
				return false;
			}
		}
	
		console.log("All matches finished. Ready for next round.");
		return true;
	}
	

	const rounds = tournamentData ? generateBracket(players, tournamentData.maxPlayers) : [];

	return (
		<AnimatePresence>
			<motion.div
				className="absolute top-[8vh] w-screen h-[calc(100vh-8vh)] backdrop-blur-sm flex items-center justify-center bg-[#1a1a1a] z-50"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
			>
				<motion.div
					className="flex flex-col items-center bg-[#2a2a2a]/90 text-white p-8 gap-8 rounded-none w-full h-full relative shadow-xl overflow-auto"
					initial={{ scale: 0.9, y: 20 }}
					animate={{ scale: 1, y: 0 }}
					exit={{ scale: 0.9, y: 20 }}
					transition={{ type: "spring", stiffness: 300, damping: 25 }}
				>
					{/* Close button */}
					<button
						className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer"
						onClick={handleClose}
					>
						<IoMdClose size={24} />
					</button>

					{/* Tournament Info */}
					<section className="w-full text-center">
						<h1 className="text-4xl font-black mb-6">Tournament Waiting Room</h1>
						{tournamentData ? (
							<div>
								<p className="text-lg font-semibold">Host: {tournamentData.hostUsername}</p>
								<p className="text-lg font-semibold">Max Players: {tournamentData.maxPlayers}</p>
								<p className="text-lg font-semibold">Current Players: {players.length}</p>
							</div>
						) : (
							<p>Loading tournament details...</p>
						)}
					</section>

					{/* Player List */}
					<section className="w-full mt-6">
						<h2 className="text-2xl font-semibold mb-4">Players in Lobby</h2>
						<ul className="list-disc pl-6">
							{players.length > 0 ? (
								players.map((player: any, index: number) => (
									<li key={index} className="text-lg">{player.username}</li>
								))
							) : (
								<li>No players yet...</li>
							)}
						</ul>
					</section>

					{/* Start Tournament Button (Only for Host) */}
					{tournamentData &&
						loggedInAccounts[0]?.username === tournamentData.hostUsername &&
						players.length === tournamentData.maxPlayers && (
							<button
								onClick={async () => {
									try {
										await axios.post(`http://${window.location.hostname}:5001/api/start-tournament`, {
											tournamentId,
										});
									} catch (error) {
										console.error('Failed to start tournament:', error);
									}
								}}
								className="mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded shadow"
							>
								Start Tournament
							</button>
					)}
					{/* Start next round button (Only for Host) */}
					{tournamentData &&
						loggedInAccounts[0]?.username === tournamentData.hostUsername && 
						readyForNextRound() && (
							<button
								onClick={async () => {
									try {
										await axios.post(`http://${window.location.hostname}:5001/api/start-next-round`, {
											tournamentId,
										});
									} catch (err) {
										console.error('Failed to start tournament:', err);
									}
								}}
								className="mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded shadow"
							>
								Start Next Round
							</button>
					)}

					{/* Bracket Section */}
					{rounds.length > 0 && (
						<section className="w-full overflow-auto mt-8 flex justify-center">
							<div className="flex items-center gap-8 min-h-[500px]">
								{rounds.map((round, roundIndex) => (
									<div
										key={roundIndex}
										className="flex flex-col justify-center items-center gap-8"
									>
										{round.map((match, matchIndex) => (
											<div
												key={matchIndex}
												className="bg-gray-700 text-white px-4 py-2 rounded shadow text-center min-w-[160px]"
											>
												{match}
											</div>
										))}
									</div>
								))}
							</div>
						</section>
					)}

				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
