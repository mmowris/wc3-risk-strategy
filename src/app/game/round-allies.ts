import { GamePlayer } from "app/player/player-type";
import { ErrorMessage } from "libs/utils";
import { MAX_PLAYERS } from "resources/constants";
import { RoundSettings } from "./settings-data";

//TODO: reset alliances on new round
//TODO: free ally needs triggers that ally/unally on alliance change

export class Alliances {
	private static instance: Alliances;
	private alliesOf: Map<player, player[]>;
	private teamNumber: Map<player, number>;
	private team: Map<number, player[]>;
	public leadingTeam: number;

	public static teamGame: boolean = false;

	//TODO: if all humans are on one team, disband team.
	constructor() {
		this.teamNumber = new Map<player, number>();
		this.alliesOf = new Map<player, player[]>();
		this.team = new Map<number, player[]>();
		this.leadingTeam = 1;
		this.setTeams();
	}

	private setTeams() {
		this.alliesOf.clear();
		this.teamNumber.clear();
		this.team.clear();

		for (let i = 0; i < MAX_PLAYERS; i++) {
			let p1: player = Player(i);
			if (!GamePlayer.fromPlayer.has(p1)) continue;
			if (GamePlayer.get(p1).isNeutral()) continue;
			if (GamePlayer.get(p1).isObserving()) continue;

			if (!this.alliesOf.has(p1)) this.alliesOf.set(p1, []);
			this.teamNumber.set(p1, this.getPlayerTeam(p1));

			if (!this.team.has(this.getPlayerTeam(p1))) this.team.set(this.getPlayerTeam(p1), []);
			this.team.get(this.getPlayerTeam(p1)).push(p1);

			for (let j = 0; j < MAX_PLAYERS; j++) {
				let p2: player = Player(j);
				if (!GamePlayer.fromPlayer.has(p2)) continue;
				if (GamePlayer.get(p2).isNeutral()) continue;
				if (GamePlayer.get(p2).isObserving()) continue;
				if (p1 == p2) continue;

				if (this.isAllied(p1, p2)) {
					try {
						this.setAlliance(p1, p2, true);
						this.setAlliance(p2, p1, true);	
					} catch (error) {
						print(error)
					}
				}

				p2 = null;
			}

			p1 = null;
		}

		// this.team.forEach((val: [], key: number) => {
		// 	print(`Team ${key} has ${val.length} players`);
		// })

		// 	this.alliesOf.forEach((val: [], key: player) => {
		// 		print(`${GetPlayerName(key)} is allied to ${val.length} players`);
		// 	})

		// 	this.teamNumber.forEach((val: number, key: player) => {
		// 		print(`${GamePlayer.get(key).coloredName()} team #: ${val}`);
		// 	})
	}

	public changeTeamNumber(p1: player, team: number) {
		SetPlayerTeam(p1, team)
	}

	public setAlliance(p1: player, p2: player, bool: boolean) {
		if (this.alliesOf.has(p1) && RoundSettings.diplomancy == 3) {
			if (this.alliesOf.get(p1).length > RoundSettings.allies) {
				ErrorMessage(p1, "You have the max amount of allies!");
				return;
			}
		}

		SetPlayerAlliance(p1, p2, ALLIANCE_PASSIVE, bool)
		SetPlayerAlliance(p1, p2, ALLIANCE_HELP_REQUEST, bool)
		SetPlayerAlliance(p1, p2, ALLIANCE_HELP_RESPONSE, bool)
		SetPlayerAlliance(p1, p2, ALLIANCE_SHARED_XP, bool)
		SetPlayerAlliance(p1, p2, ALLIANCE_SHARED_SPELLS, bool)
		SetPlayerAlliance(p1, p2, ALLIANCE_SHARED_VISION, bool)
		SetPlayerAlliance(p1, p2, ALLIANCE_SHARED_CONTROL, bool)
		
		if (RoundSettings.promode) {
			SetPlayerAlliance(p1, p2, ALLIANCE_SHARED_ADVANCED_CONTROL, bool);
		}

		if (bool) this.add(p1, p2);
		if (!bool) this.remove(p1, p2);
	}

	private add(p1: player, p2: player) {
		if (!this.alliesOf.has(p1)) {
			this.alliesOf.set(p1, []);
		}

		this.alliesOf.get(p1).push(p2);
	}

	private remove(p1: player, p2: player) {
		if (!this.alliesOf.has(p1)) return;
		if (this.alliesOf.get(p1).indexOf(p2) == -1) return;

		this.alliesOf.get(p1).splice(this.alliesOf.get(p1).indexOf(p2), 1)
	}

	public reset() {
		//TODO set new team numbers
		this.setTeams();
	}

	public isAllied(p1: player, p2: player): boolean {
		return GetPlayerAlliance(p1, p2, ALLIANCE_PASSIVE);
	}

	public unAllyLobby() {
		for (let i = 0; i < MAX_PLAYERS; i++) {
			for (let j = 0; j < MAX_PLAYERS; j++) {
				Alliances.getInstance().setAlliance(Player(i), Player(j), false);
				Alliances.getInstance().setAlliance(Player(j), Player(i), false);
			}
		}
	}

	public shitSort(): player[] {
		let result: player[] = [];

		let teamByIncome: Map<number, number> = new Map<number, number>();

		this.team.forEach((players: player[], teamNumber: number) => {
			players.sort((p1, p2) => {
				if (GamePlayer.get(p1).income < GamePlayer.get(p2).income) return 1;
				if (GamePlayer.get(p1).income > GamePlayer.get(p2).income) return -1;
				return 0;
			})

			teamByIncome.set(teamNumber, this.getTeamIncome(teamNumber));
		})

		const sortedTeams = new Map([...teamByIncome.entries()].sort((a, b) => b[1] - a[1]));

		sortedTeams.forEach((val, key) => {
			this.team.get(key).forEach(player => {
				result.push(player);
			})
		})

		this.leadingTeam = Alliances.getInstance().getPlayerTeam(result[0]);

		return result;
	}

	public getTeamIncome(teamNum: number): number {
		let result: number = 0;
		this.team.get(teamNum).forEach(player => {
			result += GamePlayer.get(player).income;
		})

		return result;
	}

	public getTeamCities(teamNum: number): number {
		let result: number = 0;
		this.team.get(teamNum).forEach(player => {
			result += GamePlayer.get(player).cities.length;
		})

		return result;
	}

	public getPlayerTeam(player: player): number {
		return GetPlayerTeam(player) + 1;
	}

	public getNumOfAllies(player: player): number {
		return this.alliesOf.get(player).length;
	}

	public static getInstance() {
		if (this.instance == null) {
			this.instance = new Alliances();
		}
		return this.instance;
	}
}