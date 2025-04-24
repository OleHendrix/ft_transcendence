function OnlineStatus()
{
	return(
		<div className="relative w-2 h-2">
			<span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping"></span>
			<span className="absolute inline-flex h-full w-full rounded-full bg-green-500"></span>
		</div>
	)
}

export default OnlineStatus