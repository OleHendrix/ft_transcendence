import { ReactNode } from "react";
import { useAccountContext } from "../contexts/AccountContext";
import { useParams } from 'react-router-dom';

function PlayerInfoProtection({ children }: { children: ReactNode }) 
{
	const { loggedInAccounts } = useAccountContext();
	const { username } = useParams();
	if (!loggedInAccounts.some(account => account.username === username))
		throw new Response('Unauthorized', { status: 401 })
	return children
}

export default PlayerInfoProtection

