import axios from "axios";
import { useState } from "react";
import { usePlayerContext } from "./contexts/PlayerContext";
import { useLoginContext } from "./contexts/LoginContext";
import { motion } from 'framer-motion';
import Player from "./assets/Player.svg";
import Player1 from "./assets/Player1.svg";
import Player2 from "./assets/Player2.svg";
import { IoMdClose } from "react-icons/io";

function Enable2FA()
{
	const { loggedInPlayers }  = usePlayerContext();
	const { indexPlayerStats } = useLoginContext();

	const [token, setToken]     = useState('');
	const [qrCode, setQrCode]   = useState<string | null>(null);
	const [show2FA, setShow2FA] = useState(false);

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
	
		const verify2FA = async () => {
		try {
			const res = await axios.post('http://localhost:5001/api/auth/verify-totp',
			{
				username: loggedInPlayers[indexPlayerStats].username,
				token
			});
	
			if (res.data.success) {
			alert('2FA enabled!');
			setShow2FA(false);
			} else {
			alert('Invalid code');
			}
		} catch (err) {
			console.error('Verification failed', err);
		}
		};
	
	return (
		<div className="w-full">
			<p className="block text-sm font-medium mb-1">Enable 2FA</p>
			<button
				onClick={handleEnable2FA}
				className="bg-[#ff914d] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#ab5a28] transition"
			>
				Enable
			</button>
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
					className="bg-[#ff914d] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#ab5a28] transition"
					>
					Verify
					</button>
				</div>
			)}
		</div>
	);
}

function EditProfile()
{
	const { loggedInPlayers }  = usePlayerContext();
	const { indexPlayerStats } = useLoginContext();

		return (
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
					<input className="w-full p-2 opacity-100 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600" placeholder="Create a new password"></input>
				</div>
				<Enable2FA />
			</div>
		);
}

export default EditProfile