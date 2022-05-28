interface RoundSettings {
	gameType: number;
	diplomancy: number;
	allies: number;
	alliesControl: number;
	fog: number;
	names: number;
	nomad: number;
	gold: boolean;
	ships: number;
	transport: boolean;
	promode: boolean;
	tournament: boolean;
	standard: boolean;
}

export const RoundSettings: RoundSettings = {
	gameType: 0,
	diplomancy: 0,
	allies: 0,
	alliesControl: 0,
	fog: 0,
	names: 0,
	nomad: 0,
	gold: false,
	ships: 0,
	transport: false,
	promode: false,
	tournament: false,
	standard: true
}