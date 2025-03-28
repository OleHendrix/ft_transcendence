import axios from "axios";
import { useEffect, useState } from "react";
import { usePlayerContext } from "./contexts/PlayerContext";
import { useLoginContext } from "./contexts/LoginContext";

function Enable2FA()
{
	const { loggedInAccounts }  = usePlayerContext();
	const { indexPlayerStats } = useLoginContext();

	const [token, setToken]     = useState('');
	const [qrCode, setQrCode]   = useState<string | null>(null);
	const [scannedQrCode, setScannedQrCode ] = useState(false);

	const handleEnable2FA = async () => {
		try {
			const res = await axios.post('http://localhost:5001/api/auth/setup-totp',
			{
				username: loggedInAccounts[indexPlayerStats].username
			});
	
			setQrCode(res.data.qrCodeUrl);
			setShow2FA(true);
			console.log('QR Code:', qrCode);
		} catch (err) {
			console.error('Error enabling 2FA:', err);
		}
		};
		handleEnable2FA();
	}, [loggedInPlayers]);
	
	const verify2FA = async () =>
	{
		try
		{
			const res = await axios.post('http://localhost:5001/api/auth/verify-totp',
			{
				username: loggedInAccounts[indexPlayerStats].username,
				token
			});
	
			if (res.data.success) {
			alert('2FA enabled!');
			} else {
			alert('Invalid code');
			}
		}
		catch (err)
		{
			console.error('Verification failed', err);
		}
	};

	return (
		<div className="w-full">
			<div className="mt-4 p-4 rounded-xl">
				{!scannedQrCode && (<>
					<p className="text-sm font-medium mb-2">Scan this QR code with Google Authenticator:</p>
					{qrCode && <img src={qrCode} alt="2FA QR Code" className="mb-4" />}
					<button
					onClick={() => setScannedQrCode(true)}
					className="bg-[#ff914d] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#ab5a28] transition">
						Done
					</button>
				</>)}

				{scannedQrCode && (<>
					<input
					type="text"
					maxLength={6}
					value={token}
					onChange={(e) => setToken(e.target.value)}
					placeholder="Enter 6-digit code"
					className="w-full px-3 py-2 rounded-xl bg-[#3a3a3a] text-white mb-2"
					/>

					<button
					onClick={verify2FA}
					className="bg-[#ff914d] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#ab5a28] transition"
					>
					Verify
					</button>
				</>)}
			</div>
		</div>
	);
}

function EditProfile()
{
	const { loggedInAccounts }  = usePlayerContext();
	const { indexPlayerStats } = useLoginContext();

	const [ settingUp2FA, setSettingUp2FA ] = useState(false);

	const disable2FA = async () =>
	{
		try
		{
			const response = await axios.post('http://localhost:5001/api/auth/delete-totp',
			{
				username: loggedInPlayers[indexPlayerStats].username
			});
		}
		catch (error)
		{
			console.error('Error disabling 2FA:', error);
		}
	}

	return (
		<div className="flex flex-col w-full text-left items-start space-y-4">
			{!settingUp2FA && (<>
				<div className="w-full">
					<p className="block text-sm font-medium mb-1">Username</p>
					<p className="w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600">{loggedInAccounts[indexPlayerStats]?.username}</p>
				</div>
				<div className="w-full">
					<p className="block text-sm font-medium mb-1">Email</p>
					<p className="w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600">{loggedInAccounts[indexPlayerStats]?.email}</p>
				</div>
				<div className="w-full">
					<p className="block text-sm font-medium mb-1">Password</p>
					<input className="w-full p-2 opacity-100 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600" placeholder="Create a new password"></input>
				</div>
				<div className="w-full">
					<p className="block text-sm font-medium mb-1">2FA</p>
					{!loggedInPlayers[indexPlayerStats].totpSecret && <button className="bg-[#ff914d] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#ab5a28] transition"
						onClick={() => { setSettingUp2FA(true) } }>
						Enable
					</button>}
					{loggedInPlayers[indexPlayerStats].totpSecret && <button className="bg-[#ff914d] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#ab5a28] transition"
						onClick={disable2FA}>
						Disable
					</button>}
				</div>
			</>)}
			{settingUp2FA && <Enable2FA />}
		</div>
	);
}

export default EditProfile