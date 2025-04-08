import axios from "axios";
import { useAccountContext } from "../contexts/AccountContext";
import { useLoginContext } from "../contexts/LoginContext";
import { SignUpFormType } from "../types";


export function useCheckSubmit()
{
	const { setNumberOfLoggedInAccounts } = useAccountContext();
	const { setShowLoginModal, setShowSignUpModal } = useLoginContext();
	console.log("Submitting form...");
	// const [isLoading, setIsLoading] = useState(false);

	async function checkSubmit(formData: SignUpFormType)
	{
		// setIsLoading(true);

		const { username, email, password } = formData;

		try
		{
			const response = await axios.post(`http://${window.location.hostname}:5001/api/add-account`, { username, email, password });

			if (response.data.success)
			{
				setNumberOfLoggedInAccounts((count) => count + 1);
				setShowSignUpModal(false);
				setShowLoginModal(true);
			}
			else
				console.log("Failed to add account:", response.data.message);
		}
		catch (error: any)
		{
			console.error("Signup error:", error.response?.data || error.message);
		}

		// setIsLoading(false);
	}

	return { checkSubmit };
}