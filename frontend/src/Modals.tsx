import { useLoginContext } from "./contexts/LoginContext";
import SignUpModal from "./SignUpModal";
import LoginModal from "./LoginModal";
import PlayerInfo from "./PlayerInfo";

function Modals()
{
	const { showSignUpModal, showLoginModal, showPlayerStats, indexPlayerStats } = useLoginContext();

	return (
		<>
			{showSignUpModal && <SignUpModal />}
			{showLoginModal && <LoginModal />}
			{showPlayerStats && <PlayerInfo />}
		</>
	);
}

export default Modals