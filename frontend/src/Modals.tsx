import { useLoginContext } from "./contexts/LoginContext";
import SignUpModal from "./SignUpModal";
import LoginModal from "./LoginModal";
import PlayerStats from "./Playerstats";

function Modals()
{
	const { showSignUpModal, showLoginModal, showPlayerStats, indexPlayerStats } = useLoginContext();

	return (
		<>
			{showSignUpModal && <SignUpModal />}
			{showLoginModal && <LoginModal />}
			{showPlayerStats && <PlayerStats />}
		</>
	);
}

export default Modals