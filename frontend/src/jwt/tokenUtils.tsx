import { AuthenticatedAccount } from "../types";
import axios from "axios";
import { API_URL } from '../utils/network';

export function getUserTokens(userId: number)
{
	const loggedInAccounts = JSON.parse(localStorage.getItem('loggedInAccounts') || '[]');
	const selectedAccount = loggedInAccounts.find((account: AuthenticatedAccount) => account.id === userId);

	const accessToken  = selectedAccount.accessToken;
	const refreshToken = selectedAccount.refreshToken;

	return { accessToken, refreshToken }
}

export function isTokenExpired(token: string)
{
	if (!token) return true;
	
	try
	{
		const payloadBase64 = token.split('.')[1];
		const payloadJson = atob(payloadBase64);
		const payload = JSON.parse(payloadJson);
	
		const exp = payload.exp;
		if (!exp) return true;
	
		const now = Math.floor(Date.now() / 1000);
		return now >= exp - 30; // already refresh 30 seconds in advance
	}
	catch (error)
	{
		console.error('Failed to decode token:', error);
		return true;
	}
}

export async function refreshTokens(refreshToken: string)
{
	try
	{
		const response = await axios.post(`${API_URL}/api/refresh-token`, { refreshToken });

		const newAccessToken  = response.data.newAccessToken;
		const newRefreshToken = response.data.newRefreshToken;

		return { newAccessToken, newRefreshToken };
	}
	catch (error)
	{
		console.error(error);
		return ;
	}
}

export function storeNewTokens(userId: number, newAccessToken: string, newRefreshToken: string)
{
	const loggedInAccountsString = localStorage.getItem('loggedInAccounts');
	if (!loggedInAccountsString) return;

	const loggedInAccounts: AuthenticatedAccount[] = JSON.parse(loggedInAccountsString);

	const updatedAccounts = loggedInAccounts.map(account =>
		{
			if (account.id === userId)
			{
				return {
					...account,
					accessToken:  newAccessToken,
					refreshToken: newRefreshToken,
				};
			}
		return account;
	});
	
	localStorage.setItem('loggedInAccounts', JSON.stringify(updatedAccounts));
}