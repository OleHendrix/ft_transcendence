import React, { useState, useEffect } from "react";
import axios from "axios";
import { PlayerType } from "../types";
import { StyledButton } from "./utilsComponents";

interface UpdateLoggedInAccounts2FAProps {
	loggedInAccounts: PlayerType[];
	setLoggedInAccounts: React.Dispatch<React.SetStateAction<PlayerType[]>>;
	selectedAccount: PlayerType | undefined;
	setSelectedAccount: React.Dispatch<React.SetStateAction<PlayerType | undefined>>;
	setTriggerFetchAccounts: React.Dispatch<React.SetStateAction<boolean>>;
	enabled: boolean;
}

function updateLoggedInAccounts_2FA({ loggedInAccounts, setLoggedInAccounts, setTriggerFetchAccounts, selectedAccount, setSelectedAccount, enabled }: UpdateLoggedInAccounts2FAProps) {
	const updatedLoggedInAccounts = loggedInAccounts.map((account) =>
		account.username === selectedAccount?.username ?
			{
				...account,
				twofa: enabled
			} : account);
	setLoggedInAccounts(updatedLoggedInAccounts);
	localStorage.setItem('loggedInAccounts', JSON.stringify(updatedLoggedInAccounts));
	setSelectedAccount(prev => ({ ...prev!, twofa: enabled }));
	setTriggerFetchAccounts(true);
}

interface Disable2FAProps {
	loggedInAccounts: PlayerType[];
	selectedAccount: PlayerType | undefined;
	setLoggedInAccounts: React.Dispatch<React.SetStateAction<PlayerType[]>>;
	setSelectedAccount: React.Dispatch<React.SetStateAction<PlayerType | undefined>>;
	setTriggerFetchAccounts: React.Dispatch<React.SetStateAction<boolean>>;
}

export async function disable2FA({ loggedInAccounts, selectedAccount, setLoggedInAccounts, setSelectedAccount, setTriggerFetchAccounts }: Disable2FAProps) {
	try {
		const jwt = loggedInAccounts.find(account => account.id === selectedAccount?.id)?.jwt;
		const response = await axios.post(`http://${window.location.hostname}:5001/api/auth/delete-totp`, {},
			{
				headers:
				{
					Authorization: `Bearer ${jwt}`
				}
			});
		if (response.data.success)
			updateLoggedInAccounts_2FA({ loggedInAccounts, setLoggedInAccounts, setTriggerFetchAccounts, selectedAccount, setSelectedAccount, enabled: false });
	}
	catch (error) {
		console.error('Error disabling 2FA:', error);
	}
}

interface Enable2FAProps {
	loggedInAccounts: PlayerType[];
	setSettingUp2FA: React.Dispatch<React.SetStateAction<boolean>>;
	selectedAccount: PlayerType | undefined;
	setLoggedInAccounts: React.Dispatch<React.SetStateAction<PlayerType[]>>;
	setTriggerFetchAccounts: React.Dispatch<React.SetStateAction<boolean>>;
	setSelectedAccount: React.Dispatch<React.SetStateAction<PlayerType | undefined>>;
}

export function Enable2FA({ loggedInAccounts, setSettingUp2FA, selectedAccount, setLoggedInAccounts, setTriggerFetchAccounts, setSelectedAccount }: Enable2FAProps) {
	const [token, setToken] = useState('');
	const [falseCode, setFalseCode] = useState(false);
	const [qrCode, setQrCode] = useState<string | null>(null);
	const [scannedQrCode, setScannedQrCode] = useState(false);

	useEffect(() => {
		const handleEnable2FA = async () => {
			if (!selectedAccount || !loggedInAccounts) {
				console.error('Selected account or logged in accounts are undefined');
				return;
			}
			try {
				const jwt = loggedInAccounts.find(account => account.id === selectedAccount?.id)?.jwt;
				console.log(jwt);
				const response = await axios.post(`http://${window.location.hostname}:5001/api/auth/setup-totp`, {},
					{
						headers:
						{
							Authorization: `Bearer ${jwt}`
						}
					});
				setQrCode(response.data.qrCodeUrl);
			}
			catch (err) {
				console.error('Error enabling 2FA:', err);
			}
		};
		handleEnable2FA();
	}, [loggedInAccounts]);

	const verify2FA = async () => {
		try {
			const jwt = loggedInAccounts.find(account => account.id === selectedAccount?.id)?.jwt;
			const response = await axios.post(`http://${window.location.hostname}:5001/api/auth/verify-setup-totp`, { token },
				{
					headers:
					{
						Authorization: `Bearer ${jwt}`
					}
				});
			if (response.data.success) {
				updateLoggedInAccounts_2FA({ loggedInAccounts, setLoggedInAccounts, setTriggerFetchAccounts, selectedAccount, setSelectedAccount, enabled: true });
				setSettingUp2FA(false);
			}
			else
				alert('Invalid code');
		}
		catch (err) {
			console.error('Verification failed', err);
			setFalseCode(true);
		}
	};

	return (
		<div className="flex flex-col justify-center items-center w-full h-full">
			<div className="rounded-xl bg-[#2a2a2a] text-center w-full">
				{!scannedQrCode &&
					(
						<>
							<p className="text-sm font-medium mb-2">Scan this QR code with Google Authenticator:</p>
							{qrCode &&
								<div className="flex justify-center mb-4 ">
									<img src={qrCode} alt="2FA QR Code" className="rounded-lg shadow-3xl" />
								</div>
							}
							<div className="flex justify-center">
								<StyledButton onClick={() => { setScannedQrCode(true) }} variant="primary" width="w-[50%]" text="Continue" />
							</div>
						</>
					)}
				{scannedQrCode &&
					(
						<div className="w-full">
							<input type="text" maxLength={6} value={token}
								onChange={(e) => { setToken(e.target.value); if (falseCode) setFalseCode(false) }}
								placeholder="Enter 6-digit code"
								className={`w-full p-2 rounded-3xl bg-[#3a3a3a] text-white mb-4 border ${falseCode ? 'border-red-800' : 'border-gray-600 focus:border-white'} focus:outline-none`} />
							<div className="flex justify-center">
								<StyledButton onClick={() => { verify2FA() }} variant="primary" text="Verify" />
							</div>
						</div>
					)}
			</div>
		</div>
	);
}