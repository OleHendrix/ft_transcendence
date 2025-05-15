import { ReactNode, useEffect } from "react";
import { useAccountContext } from "../contexts/AccountContext";
import { useNavigate, useParams } from 'react-router-dom';

function PlayerInfoProtection({ children }: { children: ReactNode }) 
{
	const navigate = useNavigate();
	const { loggedInAccounts } = useAccountContext();
	const { username } = useParams();

	useEffect(() =>
	{
		if (loggedInAccounts.length && !loggedInAccounts.some(account => account.username === username))
			navigate('/');
	}, [loggedInAccounts, username, navigate]);

	if (!loggedInAccounts.length)
		return <div className="text-white text-center mt-10">Loading account...</div>;

	return children;
}

export default PlayerInfoProtection