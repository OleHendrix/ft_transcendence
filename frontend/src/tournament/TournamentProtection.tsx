import { ReactNode, useEffect, useState } 	from "react";
import { useAccountContext } 				from "../contexts/AccountContext";
import { useParams, useNavigate } 			from 'react-router-dom';
import axios 								from "axios";
import { PlayerData } 						from "../types";
const API_URL 								= import.meta.env.VITE_API_URL;

//Fetched de gevraagde tournament op basis van het id in de params.
//Checked of het vol zit EN dat de player niet al in de tournament zit, Bij een refresh closed de socket alleen maar blijft de speler wel in het tournament
//Speler moet daarna weer door de protection. Maar lijkt alsof het vol zit.
//Als alles goed is navigeer naar Waiting Room (children)

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


