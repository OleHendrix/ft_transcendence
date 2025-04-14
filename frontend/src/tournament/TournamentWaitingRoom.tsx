import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdClose } from 'react-icons/io';
import axios from 'axios';
import { useTournamentContext } from '../contexts/TournamentContext';
import { useAccountContext } from '../contexts/AccountContext';

export default function TournamentWaitingRoom() {
	const { loggedInAccounts } = useAccountContext();
	const { tournamentId, setShowTournamentWaitingRoom } = useTournamentContext();
	const [ tournamentData, setTournamentData ] = useState<any>(null);
	const [ players, setPlayers ] = useState<any[]>([]);

	useEffect(() => {
		async function fetchTournamentData() {
			if (tournamentId === null) return;

			try {
				const response = await axios.get(`http://${window.location.hostname}:5001/api/get-tournament/${tournamentId}`);
				if (response.data) {
					console.log(response.data.players);
					setTournamentData(response.data);
					setPlayers(response.data.players);
				}
			} catch (error) {
				console.error("Error fetching tournament data:", error);
			}
		}

		fetchTournamentData();

		const interval = setInterval(fetchTournamentData, 5000);
		return () => clearInterval(interval);
	}, [tournamentId]);


	const handleClose = async () => {
		try {
			console.log("ckeck");
			const response = await axios.post(`http://${window.location.hostname}:5001/api/leave-tournament`, {
				playerId: loggedInAccounts[0].id,
				tournamentId,
			});
		} catch (error) {
			console.log(error);
		}
		setShowTournamentWaitingRoom(false);
	};

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
					{/* close button */}
					<button
						className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer"
						onClick={handleClose}
					>
						<IoMdClose size={24} />
					</button>

					{/* Tournament Info Section */}
					<section className="w-full text-center">
						<h1 className="text-3xl font-black mb-6">Tournament Waiting Room</h1>
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

					{/* Players List */}
					<section className="w-full mt-6">
						<h2 className="text-2xl font-semibold mb-4">Players in Lobby</h2>
						<ul className="list-disc pl-6">
							{players.length > 0 ? (
								players.map((player: any, index: number) => (
									<li key={index} className="text-lg">{player}</li>
								))
							) : (
								<li>No players yet...</li>
							)}
						</ul>
					</section>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
