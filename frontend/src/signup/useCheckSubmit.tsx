import axios from "axios";
import { useAccountContext } from "../contexts/AccountContext";
import { useLoginContext } from "../contexts/LoginContext";
import { SignUpFormType } from "../types";
import { API_URL } from '../utils/network';

export function useCheckSubmit()
{
	const { setShowLoginModal, setShowSignUpModal } = useLoginContext();
	console.log("Submitting form...");
	// const [isLoading, setIsLoading] = useState(false);

	async function checkSubmit(formData: SignUpFormType)
	{
		// setIsLoading(true);

		const { username, email, password } = formData;

		try
		{
			const response = await axios.post(`${API_URL}/api/add-account`, { username, email, password });

			if (response.data.success)
			{
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