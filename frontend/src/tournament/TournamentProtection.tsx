import { ReactNode, useEffect, useState } 	from "react";
import { useAccountContext } 				from "../contexts/AccountContext";
import { useParams, useNavigate } 			from 'react-router-dom';
import axios 								from "axios";
import { TournamentData } 					from "../types";
import { PlayerData } 						from "../types";
import { useGetTournamentData } 			from "./utilsFunctions";
const API_URL 								= import.meta.env.VITE_API_URL;

function TournamentProtection({children}: {children: ReactNode})
{
	const { loggedInAccounts } 	= useAccountContext();
	const { id }				= useParams();
	const navigate 				= useNavigate();

	useEffect(() =>
	{
		async function fetchTournament()
		{
			try
			{
				const response = await axios.get(`${API_URL}/api/tournament-data/${id}`);
				if (response.data.success)
				{
					const tournamentData = response.data.tournament;
					const isPlayerInTournament = tournamentData.players.some((p: PlayerData) => p.id === loggedInAccounts[0].id);
					const isTournamentFull = tournamentData.players.length >= tournamentData.maxPlayers;
					if (isTournamentFull && !isPlayerInTournament)
						navigate('/');
				}
			}
			catch (e)
			{
				navigate('/');
			}
		}
		if (loggedInAccounts.length)
			fetchTournament();
	}, [id, loggedInAccounts, navigate]);
	return children;
}

export default TournamentProtection;	



// import { ReactNode, useEffect, useState } 	from "react";
// import { useAccountContext } 				from "../contexts/AccountContext";
// import { useParams, useNavigate } 	from 'react-router-dom';
// import { TournamentData } from "../types";
// import { PlayerData } 				from "../types";
// import { useGetTournamentData } from "./utilsFunctions";

// function TournamentProtection({children}: {children: ReactNode})
// {
// 	const { loggedInAccounts } 					= useAccountContext();
// 	const { id }								= useParams();
// 	const navigate 								= useNavigate();
// 	const [ tournamentData, setTournamentData ] = useState<TournamentData | null>(null);
// 	useGetTournamentData({ id: id!, setTournamentData });
// 	useEffect(() =>	
// 	{
// 		if (tournamentData && loggedInAccounts[0])
// 		{
// 			const isPlayerInTournament = tournamentData.players.some((p: PlayerData) => p.id === loggedInAccounts[0].id);
// 			const isTournamentFull = tournamentData.players.length >= tournamentData.maxPlayers;
// 			if (isTournamentFull && !isPlayerInTournament)
// 				navigate('/');
// 		}
// 	}, [id, loggedInAccounts, navigate, tournamentData]);
// 	return children;
// }

// export default TournamentProtection;




