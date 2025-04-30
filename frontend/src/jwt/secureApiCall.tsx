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

export async function createSecureWebSocket(url: string, userId: number): Promise<WebSocket>
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

	return new Promise((resolve, reject) =>
	{
		const socket = new WebSocket(url);

		socket.onopen = () =>
		{
			console.log("WebSocket opened, authenticating");
			socket.send(JSON.stringify(
				{
				type: "AUTHENTICATE",
				accessToken: accessToken,
				}));
		}
		socket.onmessage = (event) =>
		{
			try
			{
				const data = JSON.parse(event.data);
	
				if (data.type === "AUTHORIZED")
				{
					console.log("WebSocket authenticated successfully");
					socket.onmessage = null;
					resolve(socket);
				}
				else if (data.type === "UNAUTHORIZED")
				{
					console.error("WebSocket authentication failed");
					socket.close();
					reject(new Error("WebSocket authentication failed"));
				}
			}
			catch (err)
			{
				console.error("WebSocket authentication parsing error", err);
				socket.close();
				reject(new Error("WebSocket authentication parsing error"));
			}
		};
	
		socket.onerror = (err) =>
		{
			console.error("WebSocket error", err);
			reject(err);
		};
	
		socket.onclose = () =>
		{
			console.log("WebSocket closed before authentication");
			reject(new Error("WebSocket closed before authentication"));
		};
	});
}