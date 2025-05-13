import { NavigateFunction } from "react-router-dom";
import { AuthenticatedAccount, PlayerType, SignUpFormType } from "../types";
import axios from "axios";
import { useEffect } from "react";
import { secureApiCall } from "../jwt/secureApiCall";
const API_URL = import.meta.env.VITE_API_URL;

interface UseGetAccountProps	
{
	username:           string | undefined;
	setSelectedAccount: React.Dispatch<React.SetStateAction<PlayerType | undefined>>;
	triggerFetchAccounts: boolean;
	setTriggerFetchAccounts: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AccountProps
{
	loggedInAccounts:    AuthenticatedAccount[];
	setLoggedInAccounts: React.Dispatch<React.SetStateAction<AuthenticatedAccount[]>>;
	selectedAccount:     PlayerType | undefined;
}

interface HandleAccountRemovalProps extends AccountProps
{
	setTriggerFetchAccounts: React.Dispatch<React.SetStateAction<boolean>>;
}

interface updateAccountProps extends AccountProps
{
	formData:                SignUpFormType;
	setEditProfile:          React.Dispatch<React.SetStateAction<boolean>>;
	setTriggerFetchAccounts: React.Dispatch<React.SetStateAction<boolean>>;
	navigate:                NavigateFunction;
}

interface cancelEditProps
{
	setEditProfile:       React.Dispatch<React.SetStateAction<boolean>>;
	setSettingUp2FA:      React.Dispatch<React.SetStateAction<boolean>>;
	setConfirmDisable2Fa: React.Dispatch<React.SetStateAction<boolean>>;
	setFormData:          React.Dispatch<React.SetStateAction<SignUpFormType>>;
	selectedAccount:      PlayerType | undefined;
}

export function useGetAccount({username, setSelectedAccount, triggerFetchAccounts, setTriggerFetchAccounts}: UseGetAccountProps)
{
	useEffect(() =>
	{
		if (!username) return;

		async function getAccount()
		{
			try
			{
				const response = await axios.get(`${API_URL}/api/get-account`,
					{ params: { requestedUser: username, username: username }});
				if (response.data.success)
					setSelectedAccount(response.data.user);
			}
			catch (error: any)
			{
				console.log(error.response);
			}
		}
		getAccount();
		setTriggerFetchAccounts(false);
	}, [username, setSelectedAccount, triggerFetchAccounts]);
}


function handleAccountRemoval({loggedInAccounts, setLoggedInAccounts, selectedAccount, setTriggerFetchAccounts}: HandleAccountRemovalProps)
{
	const updatedaccounts = loggedInAccounts.filter((account) => account.id !== selectedAccount?.id)
	setLoggedInAccounts(updatedaccounts);
	localStorage.setItem('loggedInAccounts', JSON.stringify(updatedaccounts));
	setTriggerFetchAccounts(true);
}

export async function logout({loggedInAccounts, setLoggedInAccounts, selectedAccount, setTriggerFetchAccounts}: HandleAccountRemovalProps)
{
	try
	{
		const userId = selectedAccount?.id;
		if (!userId) return;
		const response = await secureApiCall(userId, (accessToken) =>
			axios.post(`${API_URL}/api/logout`, {},
			{
				headers:
				{
					Authorization: `Bearer ${accessToken}`
				}
			})
		);
		if (response.data.success)
			handleAccountRemoval({loggedInAccounts, setLoggedInAccounts, selectedAccount, setTriggerFetchAccounts});
	}
	catch (error: any)	
	{
		console.error("Error in logout");
	}
}

export async function deleteAccount({loggedInAccounts, setLoggedInAccounts, selectedAccount, setTriggerFetchAccounts}: HandleAccountRemovalProps)
{
	try
	{
		const userId = selectedAccount?.id;
		if (!userId) return;

		const response = await secureApiCall(userId, (accessToken) =>
			axios.post(`${API_URL}/api/delete-account`,
			{
				userId
			},
			{
				headers:
					{
						Authorization: `Bearer ${accessToken}`
					}
			})
		);
		if (response.data.success)
			handleAccountRemoval({loggedInAccounts, setLoggedInAccounts, selectedAccount, setTriggerFetchAccounts});
	}
	catch (error)
	{
		console.error('Error deleting account:', error);
	}
}

export async function updateAccount({formData, loggedInAccounts, setLoggedInAccounts, selectedAccount, setEditProfile, setTriggerFetchAccounts, navigate}: updateAccountProps)
{
	try
	{
		const userId = selectedAccount?.id;
		if (!userId) return;
		const response = await secureApiCall(userId, (accessToken) =>
			axios.post(`${API_URL}/api/update-account`,
			{
				prev_username: selectedAccount?.username,
				username: formData.username, 
				email: formData.email, 
				password: formData.password
			},
			{
				headers:
				{
					Authorization: `Bearer ${accessToken}`
				}
			})
		);
		if (response.data.success)
		{
			setEditProfile(false);
			const updatedloggedInAccounts = loggedInAccounts.map((account) =>
			account.username === selectedAccount?.username
				? { 
					...account, 
					username: response.data.user.username,
					email: response.data.user.email 
				}
				: account
			);
			localStorage.setItem('loggedInAccounts', JSON.stringify(updatedloggedInAccounts));
			setLoggedInAccounts(updatedloggedInAccounts);
			setTriggerFetchAccounts(true);
			if (formData.username !== selectedAccount?.username)
				setTimeout(() => navigate(`/playerinfo/${response.data.user.username}`), 0);
		}
	}
	catch (error: any)
	{
		console.log(error.response.data);
	}
}

export function cancelEdit({setEditProfile, setSettingUp2FA, setConfirmDisable2Fa, setFormData, selectedAccount}: cancelEditProps)
{
	setEditProfile(false);
	setSettingUp2FA(false);
	setConfirmDisable2Fa(false);
	setFormData( prev => (
	{
			...prev,
			username: selectedAccount?.username ?? '',
			email: selectedAccount?.email ?? '',
			password: '',
			confirmPassword: ''
	}))
}

export const handleDownload = async (account: PlayerType | undefined) =>
{
	if (!account) return;
	try
	{
		const response = await secureApiCall(account.id, (accessToken) =>
			axios.post(`${API_URL}/api/get-account-data`, {},
			{
				headers:
				{
					Authorization: `Bearer ${accessToken}`
				},
				responseType: 'blob'
			})
		);

		const blob = new Blob([response.data], { type: 'application/json' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'account-data.json';
		document.body.appendChild(a);
		a.click();
		a.remove();
		window.URL.revokeObjectURL(url);
	}
	catch (error)
	{
		console.error('Error downloading data:', error);
	}
};
