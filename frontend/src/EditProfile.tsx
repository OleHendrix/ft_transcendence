import axios from "axios";
import { useEffect, useState } from "react";
import { useAccountContext } from "./contexts/AccountContext";
import { useLoginContext } from "./contexts/LoginContext";

export function Enable2FA()
{
	const { loggedInAccounts }  = useAccountContext();
	const { indexPlayerStats } = useLoginContext();

	const [token, setToken]     = useState('');
	const [qrCode, setQrCode]   = useState<string | null>(null);
	const [scannedQrCode, setScannedQrCode ] = useState(false);

	useEffect(() =>
	{
		const handleEnable2FA = async () =>
		{
			try
			{
				const res = await axios.post('http://localhost:5001/api/auth/setup-totp',
				{
					username: loggedInAccounts[indexPlayerStats].username
				});
		
				setQrCode(res.data.qrCodeUrl);
				console.log('QR Code:', qrCode);
			}
			catch (err)
			{
				console.error('Error enabling 2FA:', err);
			}
		};
		handleEnable2FA();
	}, [loggedInAccounts]);
	
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
	<div className="flex flex-col justify-center items-center w-full h-full">
  <div className="mt-4 p-4 rounded-xl bg-[#2a2a2a] text-center max-w-md w-full">
    {!scannedQrCode && (<>
      <p className="text-sm font-medium mb-2">Scan this QR code with Google Authenticator:</p>
      {qrCode && <div className="flex justify-center mb-4">
        <img src={qrCode} alt="2FA QR Code" />
      </div>}
      <div className="flex justify-center">
        <button
          onClick={() => setScannedQrCode(true)}
          className="bg-[#ff914d] text-white px-4 py-1 rounded-2xl cursor-pointer font-semibold hover:bg-[#ab5a28] transition">
          Done
        </button>
      </div>
    </>)}

    {scannedQrCode && (<>
      <input
        type="text"
        maxLength={6}
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Enter 6-digit code"
        className="w-full px-3 py-2 rounded-xl bg-[#3a3a3a] text-white mb-4"
      />

      <div className="flex justify-center">
        <button
          onClick={verify2FA}
          className="bg-[#ff914d] text-white px-4 py-1 rounded-2xl font-semibold hover:bg-[#ab5a28] cursor-pointer transition"
        >
          Verify
        </button>
      </div>
    </>)}
  </div>
</div>
	);
}

function EditProfile()
{
	const { loggedInAccounts }  = useAccountContext();
	const { indexPlayerStats } = useLoginContext();

	const [ settingUp2FA, setSettingUp2FA ] = useState(false);

	const disable2FA = async () =>
	{
		try
		{
			const response = await axios.post('http://localhost:5001/api/auth/delete-totp',
			{
				username: loggedInAccounts[indexPlayerStats].username
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
					{!loggedInAccounts[indexPlayerStats].totpSecret && <button className="bg-[#ff914d] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#ab5a28] transition"
						onClick={() => { setSettingUp2FA(true) } }>
						Enable
					</button>}
					{loggedInAccounts[indexPlayerStats].totpSecret && <button className="bg-[#ff914d] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#ab5a28] transition"
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