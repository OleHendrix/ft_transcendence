import { NavigateFunction } from "react-router-dom";
import { PlayerType, SignUpFormType } from "../types";
import axios from "axios";
import { useEffect } from "react";

interface UseGetAccountProps
{
    username: string | undefined;
    setSelectedAccount: React.Dispatch<React.SetStateAction<PlayerType | undefined>>;
}

export function useGetAccount({username, setSelectedAccount}: UseGetAccountProps)
{
    useEffect(() =>
    {
        if (!username) return;

        async function getAccount()
        {
            try
            {
                const response = await axios.get(`http://${window.location.hostname}:5001/api/get-account`,
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
    }, [username, setSelectedAccount]);
}

interface HandleAccountRemovalProps
{
	loggedInAccounts: PlayerType[];
	setLoggedInAccounts: React.Dispatch<React.SetStateAction<PlayerType[]>>;
	selectedAccount: PlayerType | undefined;
	setTriggerFetchAccounts: React.Dispatch<React.SetStateAction<boolean>>;
}

function handleAccountRemoval({loggedInAccounts, setLoggedInAccounts, selectedAccount, setTriggerFetchAccounts}: HandleAccountRemovalProps)
{
	const updatedaccounts = loggedInAccounts.filter((account) => account.id !== selectedAccount?.id)
	setLoggedInAccounts(updatedaccounts);
	localStorage.setItem('loggedInAccounts', JSON.stringify(updatedaccounts));
	setTriggerFetchAccounts(true);
}

interface logout_deleteProps
{
	loggedInAccounts: PlayerType[];
	setLoggedInAccounts: React.Dispatch<React.SetStateAction<PlayerType[]>>;
	selectedAccount: PlayerType | undefined;
	setTriggerFetchAccounts: React.Dispatch<React.SetStateAction<boolean>>;
}

export async function logout({loggedInAccounts, setLoggedInAccounts, selectedAccount, setTriggerFetchAccounts}: logout_deleteProps)
{
	try
	{
		const jwt = loggedInAccounts.find(account => account.id === selectedAccount?.id)?.jwt;
		console.log(jwt);
		const response = await axios.post(`http://${window.location.hostname}:5001/api/logout`, {},
		{
			headers:
			{
				Authorization: `Bearer ${jwt}`
			}
		});
		if (response.data.success)
			handleAccountRemoval({loggedInAccounts, setLoggedInAccounts, selectedAccount, setTriggerFetchAccounts});
	}
	catch (error: any)	
	{
		console.error("Error in logout");
	}
}

export async function deleteAccount({loggedInAccounts, setLoggedInAccounts, selectedAccount, setTriggerFetchAccounts}: logout_deleteProps)
{
	try
	{
		const response = await axios.post('http://localhost:5001/api/delete-account',
		{
			username: selectedAccount?.username
		});
		if (response.data.success)
			handleAccountRemoval({loggedInAccounts, setLoggedInAccounts, selectedAccount, setTriggerFetchAccounts});
	}
	catch (error)
	{
		console.error('Error deleting account:', error);
	}
}

interface updateAccountProps
{
	formData: SignUpFormType;
	loggedInAccounts: PlayerType[];	
	setLoggedInAccounts: React.Dispatch<React.SetStateAction<PlayerType[]>>;
	selectedAccount: PlayerType | undefined;
	setEditProfile: React.Dispatch<React.SetStateAction<boolean>>;
	setTriggerFetchAccounts: React.Dispatch<React.SetStateAction<boolean>>;
	navigate: NavigateFunction;
}

export async function updateAccount({formData, loggedInAccounts, setLoggedInAccounts, selectedAccount, setEditProfile, setTriggerFetchAccounts, navigate}: updateAccountProps)
{
	try
	{
		const response = await axios.post(`http://${window.location.hostname}:5001/api/update-account`,
		{
			prev_username: selectedAccount?.username,
			username: formData.username, 
			email: formData.email, 
			password: formData.password
		})
		if (response.data.success)
		{
			const updatedloggedInAccounts = loggedInAccounts.map((account) =>
			account.username === selectedAccount?.username
				? { 
					...account, 
					username: response.data.user.username,
					email: response.data.user.email 
				}
				: account
			);
			setLoggedInAccounts(updatedloggedInAccounts);
			localStorage.setItem('loggedInAccounts', JSON.stringify(updatedloggedInAccounts));
			setEditProfile(false);
			setTriggerFetchAccounts(true);
			navigate(`/playerinfo/${response.data.user.username}`);
		}
	}
	catch (error: any)
	{
		console.log(error.response.data);
	}
}

interface cancelEditProps
{
	setEditProfile: React.Dispatch<React.SetStateAction<boolean>>;
	setSettingUp2FA: React.Dispatch<React.SetStateAction<boolean>>;
	setConfirmDisable2Fa: React.Dispatch<React.SetStateAction<boolean>>;
	setFormData: React.Dispatch<React.SetStateAction<SignUpFormType>>;
	selectedAccount: PlayerType | undefined;
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

