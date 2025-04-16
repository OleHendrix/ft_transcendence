"use strict";
// import { useAccountContext } 	from '../contexts/AccountContext';
// // import { WebSocket } from 'ws';
// import { useTournamentContext } from '../contexts/TournamentContext';
// let socket: WebSocket; 
// export const getSocket = () => {
// 	const { loggedInAccounts } = useAccountContext();
// 	const { tournamentId } = useTournamentContext();
// 	const player = loggedInAccounts[0];
// 	if (!socket)
// 	{
// 		socket =  new WebSocket(`ws://${window.location.hostname}:5001/ws/join-tournament?playerId=${player.id}&playerUsername=${player.username}&tournamentId=${tournamentId}`);
// 	}
// 	return socket;
// };
