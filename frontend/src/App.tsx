import { useState, useEffect } from 'react'
import PlayerType from "./types"
import Navbar from "./Navbar";
import Hero from "./Hero";
import './index.css'
import axios from "axios";

function App()
{
	const [players, setPlayers] = useState<PlayerType[]>([]);
	const [playerCount, setPlayerCount] = useState(0);

	const [loggedInPlayers, setLoggedInPlayers] = useState<PlayerType[]>([]);

	useEffect(() =>
	{
		const savedLoggedInPlayers = localStorage.getItem('loggedInPlayers');
		if (savedLoggedInPlayers)
			setLoggedInPlayers(JSON.parse(savedLoggedInPlayers));

		async function fetchPlayers()
		{
			try
			{
				const response = await axios.get('http://localhost:5001/api/getplayers');
				if (response.data.success)
					setPlayers(response.data.players);
			}
			catch (error: any)
			{
				console.log(error.response.data);
			}
		} fetchPlayers();
	}, [playerCount])

	return (
		<div className='h-screen w-screen bg-[#222222] font-satoshi text-white'>
			<Navbar players={players} setPlayerCount={setPlayerCount} loggedInPlayers={loggedInPlayers} setLoggedInPlayers={setLoggedInPlayers} />
			<Hero players={players} setPlayerCount={setPlayerCount} loggedInPlayers={loggedInPlayers} setLoggedInPlayers={setLoggedInPlayers}/>
		</div>
	)
}

export default App
