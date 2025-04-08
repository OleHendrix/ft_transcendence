// hooks/useTournamentForm.ts
import { useState } from "react";

export function useTournamentForm() {
	const [name, setName] = useState('');
	const [maxPlayers, setMaxPlayers] = useState(8);
	const [scoreToWin, setScoreToWin] = useState(5);
	const [isSaving, setIsSaving] = useState(false);

	const resetForm = () => {
		setName('');
		setMaxPlayers(8);
		setScoreToWin(5);
	};

	const handleSubmit = () => {
		setIsSaving(true);
		console.log({ name, maxPlayers, scoreToWin });

		setTimeout(() => setIsSaving(false), 1000);
	};

	return {
		name, setName,
		maxPlayers, setMaxPlayers,
		scoreToWin, setScoreToWin,
		isSaving,
		handleSubmit,
		resetForm,
	};
}
