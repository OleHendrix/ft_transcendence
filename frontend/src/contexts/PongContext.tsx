import { createContext, useState, useEffect, useRef, useMemo, Dispatch, SetStateAction, ReactNode, useContext } from "react";
import { PongState, Result, Match } 			from "../types";

type PongContextType = {
	pongState: PongState;
	setPongState: Dispatch<SetStateAction<PongState>>;
	resetPongState: () => void;

	match: Match;
	setMatch: React.Dispatch<React.SetStateAction<Match>>;
};

const PongContext = createContext<PongContextType | null>(null);

const defaultPongState: PongState = {
	p1: { pos: { x: 3, y: 50 }, size: { x: 2, y: 20 }, dir: { x: 0, y: 0 }, colour: "#ff914d", lastBounce: 0 },
	p2: { pos: { x: 95, y: 50 }, size: { x: 2, y: 20 }, dir: { x: 0, y: 0 }, colour: "#134588", lastBounce: 0 },
	p1Score: 0,
	p2Score: 0,
	p1Input: 0,
	p2Input: 0,
	ball: { pos: { x: 200, y: 200 }, prevPos: { x: 200, y: 200 }, size: { x: 2, y: 2 }, dir: { x: 1, y: 1 } },
	lastUpdate: -1,
	ai: { lastActivation: 0, desiredY: 0 },
	maxPoints: 3,
	p1Won: null,
	timer: 180000,
	result: Result.PLAYING,
};

export function PongProvider({ children }: {children: ReactNode})
{
	const [pongState, setPongState] = useState<PongState>(defaultPongState);

	const resetPongState = () => setPongState(defaultPongState);

	const [match, setMatch] = useState<Match>({
		state: defaultPongState,
		p1: { id: -1, username: "" },
		p2: { id: -1, username: "" },
		isLocalGame: false,
		tournamentId: -1,
	});

	const value = useMemo(() => ({
		pongState,
		setPongState,
		resetPongState,
		match,
		setMatch,
	}), [pongState]);

	return (
		<PongContext.Provider value={value}>
			{ children }
		</PongContext.Provider>
	);
}

export function usePongContext()
{
	const context = useContext(PongContext);
	if (!context)
		throw new Error("Error");
	return context;
}
