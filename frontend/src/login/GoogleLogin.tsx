import { useCallback, useEffect } from "react";

declare global
{
	interface Window
	{
		google: any;
	}
}

const GoogleLogin = () =>
{
	useEffect(() =>
	{
		window.google.accounts.id.initialize({
			client_id: '408262727372-2ouk3afcmpungp8bcebnnoto6odare6n.apps.googleusercontent.com',
			callback: handleCredentialResponse,
		});

		window.google.accounts.id.renderButton(
			document.getElementById('google-login'),
			{ theme: 'outline', size: 'large'}
		);

		window.google.accounts.id.prompt();
	}, []);

	const handleCredentialResponse = (response: any) =>
	{
		console.log('Encoded JWT id token: ' + response.credential);
	};

	return <div id="google-login"></div>;
}

export default GoogleLogin;