import { SlTrophy } 			from "react-icons/sl";
import { TournamentData } 		from "../types";
import { TbTournament } 		from "react-icons/tb";
import axios					from "axios";
import { BiRocket } 			from "react-icons/bi";
import BackgroundTournament 	from '../../assets/BackgroundTournament.svg';

export function WinnerMessage({ username }: {username: string})
{
	return (
		<div className="w-full lg:w-6/8 flex flex-col justify-center items-center">
			<h1 className='text-2xl font-bold text-center'>Congratulations <span className='text-[#ff914d]'>{username}!</span></h1>
			<p className='text-gray-400 text-center mb-2'>You won the tournament!</p>
			<SlTrophy className='text-[#ff914d]' />
		</div>
	);
}

interface RoundsProps
{
	rounds: 		string[][];
	tournamentData: TournamentData | null;
	matchCounter: 	number;
}

export function Rounds({ rounds, tournamentData, matchCounter }: RoundsProps)
{
	return (
		<div className="w-full lg:w-6/8 flex flex-col justify-start space-y-12">
			<div className="flex flex-col items-center w-full">
				<div className='flex-col mb-6'>
					<h2 className="text-m font-semibold text-center">{`Round ${tournamentData!.matchRound}/${Math.log2(tournamentData!.maxPlayers)}`}</h2>
					<p className='flex items-center gap-2'>Matches to be played <TbTournament className='text-[#ff914d]' /></p>
				</div>
				<div className="flex flex-col gap-10 justify-start items-center w-fit px-4">
					{rounds.map((round, roundIndex) =>
					(
						<div key={roundIndex} className="flex justify-center gap-6 min-w-[200px]">
							{round.map((match, matchIndex) =>
							{
								const currentMatchNumber = matchCounter++;
								return (
									<div key={matchIndex} className={`bg-[#134588] text-white text-xs flex-col px-4 py-1 text-center font-bold shadow-2xl ${(roundIndex + 1 !== tournamentData?.matchRound || match.includes('TBD')) ? 'opacity-30' : ''}`}>
										<p className='text-[8px] font-light'>{`Match ${currentMatchNumber}`}</p>
										{match}
									</div>
								);
							})}
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

interface ButtonFunctionProps
{
	id: 			string;
	tournamentData: TournamentData | null;
}

export async function startTournament({ id, tournamentData }: ButtonFunctionProps)
{
	try
	{
		await axios.post(`http://${window.location.hostname}:5001/api/start-tournament`, { id: Number(id) });
		await axios.post(`http://${window.location.hostname}:5001/api/send-message`,
		{
			content: `Tournament ${id} is starting!, ${tournamentData?.players.map(player => player.username).join(', ')}, get ready`,
			senderId: 1,
			receiverId: 1,
		})
	}
	catch (error)
	{
		console.error('tournamentWaitingRoom:ON_CLICK:start-tournament:ERROR:', error);
	}
}

export async function startNextRound({ id, tournamentData }: ButtonFunctionProps)
{
	
	try
	{
		await axios.post(`http://${window.location.hostname}:5001/api/start-next-round`, { id: Number(id) });
		await axios.post(`http://${window.location.hostname}:5001/api/send-message`,
		{
			content: `The next round of tournament ${id} is starting!, ${tournamentData?.players.map(player => player.username).join(', ')}, get ready`,
			senderId: 1,
			receiverId: 1,
		})
	}
	catch (error) 
	{
		console.error('tournamentWaitingRoom:ON_CLICK:start-next-round:ERROR:', error);
	}
}

interface TournamentButtonProps
{
	tournamentData: 	TournamentData | null;
	onClick: 			() => void;
	variant: 			'start' | 'next';
	disabled: 			boolean;
}

export function TournamentButton({ tournamentData, onClick, variant, disabled }: TournamentButtonProps)
{
	return (
		<button className={`px-3 flex items-center gap-2 py-0 h-10 ${variant === 'start' ? 'bg-[#ff914d]' : 'bg-[#134588]'} text-white font-semibold rounded-3xl shadow-lg transition ${variant === 'start' && tournamentData?.players.length !== tournamentData?.maxPlayers ? 'opacity-30' : 'cursor-pointer'}`}
			disabled={disabled}
			onClick={onClick}>
			{variant === 'start' ? 'Start Tournament' : 'Start Next Round'} <BiRocket className='text-white' />
		</button>
	)	
}

export function BackgroundImage()
{
	return (
		<img
			src={BackgroundTournament}
			alt="Tournament Background"
			className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none"
			style={{ opacity: 0.10 }}/>	
	)
}