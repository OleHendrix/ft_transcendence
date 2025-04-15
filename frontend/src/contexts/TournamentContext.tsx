import { createContext, useState, useMemo, Dispatch, SetStateAction, ReactNode, useContext } from "react";

type TournamentContextType = {
	tournamentId: number | null;
	setTournamentId: Dispatch<SetStateAction<number | null>>;

	showTournamentSetup: boolean;
	setShowTournamentSetup: Dispatch<SetStateAction<boolean>>;

	showTournamentLobbyList: boolean;
	setShowTournamentLobbyList: Dispatch<SetStateAction<boolean>>;

	showTournamentWaitingRoom: boolean;
	setShowTournamentWaitingRoom: Dispatch<SetStateAction<boolean>>;

	players: any[];
	setPlayers: Dispatch<SetStateAction<any[]>>;

	tournamentData: any | null;
	setTournamentData: Dispatch<SetStateAction<any | null>>;
};


const TournamentContext = createContext<TournamentContextType | null>(null);

export function TournamentProvider({ children }: {children: ReactNode})
{
	const [ tournamentId, setTournamentId ] = useState<number | null>(null);
	const [ showTournamentSetup, setShowTournamentSetup ]			= useState(false);
	const [ showTournamentLobbyList, setShowTournamentLobbyList ]	= useState(false);
	const [ showTournamentWaitingRoom, setShowTournamentWaitingRoom] = useState(false);
	const [players, setPlayers] = useState<any[]>([]);
	const [tournamentData, setTournamentData] = useState<any | null>(null);
	
	const value = useMemo(() => (
		{
			tournamentId, setTournamentId,
			showTournamentSetup, setShowTournamentSetup,
			showTournamentLobbyList, setShowTournamentLobbyList,
			showTournamentWaitingRoom, setShowTournamentWaitingRoom,
			players, setPlayers,
			tournamentData, setTournamentData,
		}
	), [
		tournamentId, setTournamentId,
		showTournamentSetup, setShowTournamentSetup,
		showTournamentLobbyList, setShowTournamentLobbyList,
		showTournamentWaitingRoom, setShowTournamentWaitingRoom,
		players, setPlayers,
		tournamentData, setTournamentData,
	]);
	
	return (
		<TournamentContext.Provider value={value}>
			{ children }
		</TournamentContext.Provider>
	);
}

export function useTournamentContext()
{
	const context = useContext(TournamentContext);
	if (!context)
		throw new Error("Error");
	return context;
}
