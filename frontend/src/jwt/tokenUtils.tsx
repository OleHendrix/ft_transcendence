

export function getUserTokens(userId: number)
{
	const jwt = loggedInAccounts.find(account => account.id === userId)?.jwt;
}