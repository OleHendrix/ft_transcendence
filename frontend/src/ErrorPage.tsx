import logo from "../assets/Logo.png";
import { useNavigate, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { useEffect, useState } from 'react';

function ErrorPage()
{
	const navigate = useNavigate();
	const error = useRouteError();

	const [status, setStatus] = useState(404);
	const [message, setMessage] = useState('Not Found');


	useEffect(() =>
	{
		if (error instanceof Response)
		{
			setStatus(error.status);
			error.text().then((text) => setMessage(text));
		}
	}, [error]);

	return(
		<div className='h-screen min-h-screen w-screen flex flex-col justify-center items-center overflow-x-hidden bg-[#222222] font-satoshi text-white'>
			<img src={logo} alt="Logo" className="h-38 w-auto hover:cursor-pointer" onClick={() => navigate('/')} />
			<h1 className="text-2xl"><span className="text-[#ff914d] font-black">Oops, </span>{`${status}` + ' ' + message}</h1>
			<div className="h-42"></div>
		</div>
	)
}

export default ErrorPage