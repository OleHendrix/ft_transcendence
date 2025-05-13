import React, { useState, useEffect } from "react";
import axios from "axios";
import { AuthenticatedAccount, PlayerType } from "../types";
import { EditIcon, StyledButton } from "./utilsComponents";
import { secureApiCall } from "../jwt/secureApiCall";
const API_URL = import.meta.env.VITE_API_URL;

interface TwoFAProps
{
	loggedInAccounts:        AuthenticatedAccount[];
	setLoggedInAccounts:     React.Dispatch<React.SetStateAction<AuthenticatedAccount[]>>;
	selectedAccount:         PlayerType | undefined;
	setSelectedAccount:      React.Dispatch<React.SetStateAction<PlayerType | undefined>>;
	setTriggerFetchAccounts: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UpdateLoggedInAccounts2FAProps extends TwoFAProps
{
	enabled: boolean;
}

interface Enable2FAProps extends TwoFAProps
{
	setSettingUp2FA: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Display2FAProps extends TwoFAProps
{
	editProfile:          boolean;
	setEditProfile:       React.Dispatch<React.SetStateAction<boolean>>;
	confirmDisable2Fa:    boolean;
	setConfirmDisable2Fa: React.Dispatch<React.SetStateAction<boolean>>;
	settingUp2FA:         boolean;
	setSettingUp2FA:      React.Dispatch<React.SetStateAction<boolean>>;
}

function updateLoggedInAccounts_2FA({loggedInAccounts, setLoggedInAccounts, setTriggerFetchAccounts, selectedAccount, setSelectedAccount, enabled}: UpdateLoggedInAccounts2FAProps)
{
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

export async function disable2FA({loggedInAccounts, selectedAccount, setLoggedInAccounts, setSelectedAccount, setTriggerFetchAccounts}: TwoFAProps)
{
	try
	{
		const userId = selectedAccount?.id;
		if (!userId) return;
		const response = await secureApiCall(userId, (accessToken) =>
			axios.post(`${API_URL}/api/auth/delete-totp`, {},
			{
				headers:
				{
					Authorization: `Bearer ${accessToken}`
				}
			})
		);
		if (response.data.success)
			updateLoggedInAccounts_2FA({loggedInAccounts, setLoggedInAccounts, setTriggerFetchAccounts, selectedAccount, setSelectedAccount, enabled: false});
	}
	catch (error)
	{
		console.error('Error disabling 2FA:', error);
	}
}

export function Enable2FA({loggedInAccounts, setSettingUp2FA, selectedAccount, setLoggedInAccounts, setTriggerFetchAccounts, setSelectedAccount}: Enable2FAProps)
{
	const [token, setToken]    	 												= useState('');
	const [falseCode, setFalseCode] 											= useState(false);
	const [qrCode, setQrCode]   												= useState<string | null>(null);
	const [scannedQrCode, setScannedQrCode ] 									= useState(false);

	useEffect(() =>
	{
		const handleEnable2FA = async () =>
		{
			if (!selectedAccount || !loggedInAccounts)
			{
				console.error('Selected account or logged in accounts are undefined');
				return;
			}
			try
			{
				const userId = selectedAccount?.id;
				if (!userId) return;

				const response = await secureApiCall(userId, (accessToken) =>
					axios.post(`${API_URL}/api/auth/setup-totp`, {},
					{
						headers:
						{
							Authorization: `Bearer ${accessToken}`
						}
					})
				);
				setQrCode(response.data.qrCodeUrl);
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
			const userId = selectedAccount?.id;
			if (!userId) return;

			const response = await secureApiCall(userId, (accessToken) =>
				axios.post(`${API_URL}/api/auth/verify-setup-totp`, {token},
				{
					headers:
					{
						Authorization: `Bearer ${accessToken}`
					}
				})
			);
			if (response.data.success)
			{
				updateLoggedInAccounts_2FA({loggedInAccounts, setLoggedInAccounts, setTriggerFetchAccounts, selectedAccount, setSelectedAccount, enabled: true});
				setSettingUp2FA(false);
			}
			else
				alert('Invalid code');
		}
		catch (err)
		{
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
						<StyledButton onClick={() => {setScannedQrCode(true)}} variant="primary" width="w-[50%]" text="Continue" />
					</div>
				</>
			)}
			{scannedQrCode && 
			(
				<div className="w-full">
					<input type="text" maxLength={6} value={token}
						onChange={(e) => {setToken(e.target.value); if (falseCode) setFalseCode(false)}}
						placeholder="Enter 6-digit code"
						className={`w-full p-2 rounded-3xl bg-[#3a3a3a] text-white mb-4 border ${falseCode ? 'border-red-800' :  'border-gray-600 focus:border-white'} focus:outline-none`}/>
				<div className="flex justify-center">
					<StyledButton onClick={() => {verify2FA()}} variant="primary" text="Verify" />
				</div>
			</div>
			)}
			</div>
		</div>
	);
}

export function Display2FA({ loggedInAccounts, selectedAccount, setLoggedInAccounts, setSelectedAccount, setTriggerFetchAccounts, editProfile, setEditProfile, confirmDisable2Fa, setConfirmDisable2Fa, settingUp2FA, setSettingUp2FA}: Display2FAProps)
{

	return (
		<>
		<div className="w-full">
			<div className="flex items-end justify-between gap-2">
				<p className="block text-sm font-medium mb-1">2FA</p>
			</div>
			{!settingUp2FA &&
				(
					<div className="w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600 flex justify-between">
						<p>{selectedAccount?.twofa ? 'Yes' : 'No'}</p>
						{editProfile && <EditIcon onClick={() => { !selectedAccount?.twofa ? setSettingUp2FA(true) : setConfirmDisable2Fa(true) }} keyName="edit-2fa" />}
					</div>
				)}
			{settingUp2FA && editProfile && <Enable2FA loggedInAccounts={loggedInAccounts} setSettingUp2FA={setSettingUp2FA} selectedAccount={selectedAccount} setLoggedInAccounts={setLoggedInAccounts} setTriggerFetchAccounts={setTriggerFetchAccounts} setSelectedAccount={setSelectedAccount} />}
		</div>
		{confirmDisable2Fa &&
		(
			<StyledButton onClick={() => { disable2FA({ loggedInAccounts, selectedAccount, setLoggedInAccounts, setSelectedAccount, setTriggerFetchAccounts }); setConfirmDisable2Fa(false) }} 
				variant="secondary" text="Confirm disable 2FA" />
		)}
		</>
	)
}