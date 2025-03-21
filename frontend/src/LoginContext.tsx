import { createContext, useState, useEffect, useMemo, Dispatch, SetStateAction, ReactNode, useContext } from "react";

type LoginContextType = 
{
	showSignupModal: boolean;
	setShowSignupModal: Dispatch<SetStateAction<boolean>>;
	showLoginModal: boolean;
	setShowLoginModal: Dispatch<SetStateAction<boolean>>;
	showPlayerStats: boolean;
	setShowPlayerStats: Dispatch<SetStateAction<boolean>>;
};

const LoginContext = createContext<LoginContextType | null>(null);

export function LoginProvider({ children }: {children: ReactNode})
{
	const [showSignupModal, setShowSignupModal] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [showPlayerStats, setShowPlayerStats] = useState(false);

	const value = useMemo(() => (
	{
		showSignupModal, setShowSignupModal,
		showLoginModal, setShowLoginModal,
		showPlayerStats, setShowPlayerStats,
	}), [showSignupModal, showLoginModal, showPlayerStats]);

	return (
		<LoginContext.Provider value={value}>
			{ children }
		</LoginContext.Provider>
	);
}

export function useLoginContext()
{
	const context = useContext(LoginContext);
	if (!context)
		throw new Error("Error");
	return context;
}