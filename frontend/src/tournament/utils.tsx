
export function localStorageUpdateTournamentId(id: number | null) {
	console.log(`localStorgaeUpdate:TournamentId:${id}`);
	if (id === -1) {
		localStorage.removeItem("tournamentId");
	} else {
		localStorage.setItem("tournamentId", JSON.stringify(id));
	}
}

