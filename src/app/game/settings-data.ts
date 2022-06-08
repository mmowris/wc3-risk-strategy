export const MODES = {
	UNRANKED: "Unranked",
	FFA: "FFA",
	TEAMSOF2: "Teams of 2"
}

interface RoundSettings {
	gameType: number;
	diplomancy: number;
	allies: number;
	alliesControl: number;
	fog: number;
	nomad: number;
	gold: boolean;
	ships: number;
	transport: boolean;
	promode: boolean;
	tournament: boolean;
	standard: boolean;
	mode: string;
}

export const RoundSettings: RoundSettings = {
	gameType: 0,
	diplomancy: 0,
	allies: 0,
	alliesControl: 0,
	fog: 0,
	nomad: 0,
	gold: false,
	ships: 0,
	transport: false,
	promode: false,
	tournament: false,
	standard: true,
	mode: MODES.FFA
}