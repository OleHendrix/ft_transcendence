import { useEffect } from "react";
import axios from "axios";
import { PlayerType } from "../types";

interface UseGetAccountProps
{
    username: string | undefined;
    setSelectedAccount: React.Dispatch<React.SetStateAction<PlayerType | undefined>>;
}

export function useGetAccount({username, setSelectedAccount}: UseGetAccountProps)
{
    useEffect(() =>
    {
        if (!username) return;

        async function getAccount()
        {
            try
            {
                const response = await axios.get(`http://${window.location.hostname}:5001/api/get-account`,
                    { params: { requestedUser: username, username: username }});
                if (response.data.success)
                    setSelectedAccount(response.data.user);
            }
            catch (error: any)
            {
                console.log(error.response);
            }
        }
        getAccount();
    }, [username, setSelectedAccount]);
}