import axios from "axios";
import { useAccountContext } from "../contexts/AccountContext";
import { useState } from "react";
import { Round } from "../types";
import { AddGame } from "../Hero";


export default function useLocalTournament()
{
	const { loggedInAccounts } = useAccountContext();
	const [ tournamentId, setTournamentId ] = useState(-1);
	const [ rounds, setRounds ] = useState<Round[]>([]);

	async function startLocalTournament()
	{
		try
		{
			const host       = { username: loggedInAccounts[0].username, id: loggedInAccounts[0].id};
			const maxPlayers = loggedInAccounts.length;

			let response = await axios.post(`http://${window.location.hostname}:5001/api/create-tournament`, { host, maxPlayers });

			// const id = response.data;
			setTournamentId(response.data.tournamentId);

			for (let i = 1; i < maxPlayers; i++)
			{
				const player = { username: loggedInAccounts[i].username, id: loggedInAccounts[i].id};
				console.log(tournamentId);
				response = await axios.post(`http://${window.location.hostname}:5001/api/join-tournament`, { player, tournamentId: tournamentId });
				if (response.data.start === true)
					setRounds(response.data.rounds);
			}
		}
		catch (error)
		{
			console.error(error);
		}
	}

	async function manageTournament()
	{
		for (const round of rounds)
		{
			console.log(round);
			await AddGame(round.p1, round.p2, true, tournamentId);
		}

		try
		{
			let response = await axios.post(`http://${window.location.hostname}:5001/api/tournament`, { tournamentId });
			if (response.data.end === true)
				console.log("Tournament finished!", response.data.winner);

		}
		catch (error)
		{
			console.error(error);
		}
	}

	return { startLocalTournament, manageTournament, tournamentId, rounds };
}