import { getUserTokens, isTokenExpired, refreshTokens, storeNewTokens } from "./tokenUtils";

export async function secureApiCall(userId: number, apiCall: (accessToken: string) => Promise<any>)
{
	let { accessToken, refreshToken } = getUserTokens(userId);

	if (isTokenExpired(accessToken) === true)
	{
		const newTokens = await refreshTokens(refreshToken);

		if (newTokens)
		{
			accessToken  = newTokens.newAccessToken;
			refreshToken = newTokens.newRefreshToken;

			storeNewTokens(userId, accessToken, refreshToken);
		}
	}

	return apiCall(accessToken);
}