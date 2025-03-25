import { motion, AnimatePresence } from 'framer-motion';
import { IoMdClose } from "react-icons/io";
import { usePlayerContext } from "./contexts/PlayerContext";
import { useLoginContext } from "./contexts/LoginContext";
import Player from "./assets/Player.svg";
import Player1 from "./assets/Player1.svg";
import Player2 from "./assets/Player2.svg";
import axios from 'axios';
import { useState } from 'react';

function PlayerStats()
{
	const { loggedInPlayers, setLoggedInPlayers } = usePlayerContext();
	const { setShowPlayerStats, indexPlayerStats } = useLoginContext();
	const [qrCode, setQrCode] = useState<string | null>(null);
	const [token, setToken] = useState('');
	const [show2FA, setShow2FA] = useState(false);

	// Call backend to generate QR code
	const handleEnable2FA = async () => {
	try {
		const res = await axios.post('http://localhost:5001/api/auth/setup-totp',
		{
			username: loggedInPlayers[indexPlayerStats].username
		});

		setQrCode(res.data.qrCodeUrl);
		setShow2FA(true);
		console.log('QR Code:', qrCode);
	} catch (err) {
		console.error('Error enabling 2FA:', err);
	}
	};

	// Submit 6-digit code
	const verify2FA = async () => {
	try {
		const res = await axios.post('http://localhost:5001/api/auth/verify-totp',
		{
			username: loggedInPlayers[indexPlayerStats].username,
			token
		});

		if (res.data.success) {
		alert('✅ 2FA enabled!');
		setShow2FA(false);
		} else {
		alert('❌ Invalid code');
		}
	} catch (err) {
		console.error('Verification failed', err);
	}
	};

	return (
		<AnimatePresence>
			<motion.div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
				<motion.div className="flex flex-col items-center bg-[#2a2a2a] text-white p-8 gap-8 rounded-lg w-full max-w-md relative shadow-xl" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
					<button className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer"
						onClick={() => setShowPlayerStats(false)}>
						<IoMdClose size={24} />
					</button>

					<div className="flex flex-col items-center gap-2">
						<h2 className="text-2xl font-bold text-center">{loggedInPlayers[indexPlayerStats]?.username}</h2>
						<img src={loggedInPlayers.length > 2 ? Player : indexPlayerStats === 0 ? Player1 : indexPlayerStats === 1 ? Player2 : Player} className="h-16 w-auto"/>
					</div>

					<div className="flex flex-col w-full text-left items-start space-y-4">
						<div className="w-full">
							<p className="block text-sm font-medium mb-1">Username</p>
							<p className="w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600">{loggedInPlayers[indexPlayerStats]?.username}</p>
						</div>
						<div className="w-full">
							<p className="block text-sm font-medium mb-1">Email</p>
							<p className="w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600">{loggedInPlayers[indexPlayerStats]?.email}</p>
						</div>
						<div className="w-full">
							<p className="block text-sm font-medium mb-1">Password</p>
							<p className="w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600">{('').padStart(loggedInPlayers[indexPlayerStats]?.password.length, '*')}</p>
						</div>
						<div className="w-full">
							<p className="block text-sm font-medium mb-1">Enable 2FA</p>
							<button
								onClick={handleEnable2FA}
								className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
							>
								Enable
							</button>
							</div>

								{show2FA && (
								<div className="mt-4 bg-gray-800 p-4 rounded-xl border border-gray-600">
									<p className="text-sm font-medium mb-2">Scan this QR code with Google Authenticator:</p>
									{qrCode && <img src={qrCode} alt="2FA QR Code" className="mb-4" />}

									<input
									type="text"
									maxLength={6}
									value={token}
									onChange={(e) => setToken(e.target.value)}
									placeholder="Enter 6-digit code"
									className="w-full px-3 py-2 rounded-xl bg-gray-700 text-white mb-2"
									/>

									<button
									onClick={verify2FA}
									className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition"
									>
									Verify
									</button>
								</div>
							)}
					</div>

					<div className="flex flex-col items-center mt-4">
						<h2 className="text-2xl font-bold text-center">Stats</h2>
						<div className="w-full grid grid-cols-3 gap-2 p-2 mt-2">
							<div className="stat flex flex-col items-center">
								<div className="stat-title text-green-800 font-black">Wins</div>
								<div className="stat-value">{loggedInPlayers[indexPlayerStats]?.wins}</div>
							</div>
							<div className="stat flex flex-col items-center">
								<div className="stat-title font-black">Draws</div>
								<div className="stat-value">{loggedInPlayers[indexPlayerStats]?.draws}</div>
							</div>
							<div className="stat flex flex-col items-center">
								<div className="stat-title text-red-800 font-black">Loses</div>
								<div className="stat-value">{loggedInPlayers[indexPlayerStats]?.loses}</div>
							</div>
						</div>
					</div>
					<motion.button className="w-full pt-2 bg-[#ff914d] px-4 py-2 font-bold shadow-2xl rounded-3xl hover:bg-[#ab5a28] hover:cursor-pointer"
						whileHover={ {scale: 1.03}}
						whileTap={ {scale: 0.97}}
						onClick={() =>
						{
							const updatedPlayers = loggedInPlayers.filter((player, index) => index !== indexPlayerStats)
							setLoggedInPlayers(updatedPlayers);
							localStorage.setItem('loggedInPlayers', JSON.stringify(updatedPlayers));
							setShowPlayerStats(false)
						}}>Logout
					</motion.button> 
				</motion.div>
			</motion.div>
		</AnimatePresence>
	)
}

export default PlayerStats