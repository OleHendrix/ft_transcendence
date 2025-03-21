import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useLoginContext } from "./LoginContext";
import { SignUpModal, LoginModal, PlayerStats } from "./Players";

function Modals()
{
	const { showSignupModal, showLoginModal, showPlayerStats, indexPlayerStats } = useLoginContext();

	return (
		<>
			{showSignupModal && <SignUpModal />}
			{showLoginModal && <LoginModal />}
			{showPlayerStats && <PlayerStats indexPlayerStats={indexPlayerStats} />}
		</>
	);
}

export default Modals