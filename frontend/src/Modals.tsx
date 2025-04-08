import { useLoginContext } from "./contexts/LoginContext";
import SignUpModal from "./signup/SignUpModal";
import LoginModal from "./login/LoginModal";
import PlayerInfo from "./user/PlayerInfo";

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