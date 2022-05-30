import { GamePlayer } from "app/player/player-type";
import { MAX_PLAYERS } from "resources/constants";
//TODO: refactor this to use a <gameplayer, gameplayer[]> map
//I can then just track allies of a player
//Free ally mode can not support team scoreboard
export class Alliances {
	private static instance: Alliances;
	private alliesOf: Map<player, player[]>;
	private teamNumber: Map<player, number>;
	private team: Map<number, player[]> //TODO
	//TODO: if all humans are on one team, disband team.
	constructor() {
		this.teamNumber = new Map<player, number>();
		this.alliesOf = new Map<player, player[]>();
		this.setTeams();
	}

	private setTeams() {
		this.alliesOf.clear();
		this.teamNumber.clear();

		for (let i = 0; i < MAX_PLAYERS; i++) {
			let p1: player = Player(i);
			if (!GamePlayer.fromPlayer.has(p1)) continue;
			if (GamePlayer.get(p1).isNeutral()) continue;
			if (GamePlayer.get(p1).isObserving()) continue;

			if (!this.alliesOf.has(p1)) this.alliesOf.set(p1, []);
			this.teamNumber.set(p1, GetPlayerTeam(p1));

			for (let j = 0; j < MAX_PLAYERS; j++) {
				let p2: player = Player(j);
				if (!GamePlayer.fromPlayer.has(p2)) continue;
				if (GamePlayer.get(p2).isNeutral()) continue;
				if (GamePlayer.get(p2).isObserving()) continue;
				if (p1 == p2) continue;

				if (this.isAllied(p1, p2)) {
					this.alliesOf.get(p1).push(p2);
				}

				p2 = null;
			}

			p1 = null;
		}

		this.alliesOf.forEach((val: [], key: player) => {
			print(`${GetPlayerName(key)} is allied to ${val.length} players`)
		})

		this.teamNumber.forEach((val: number, key: player) => {
			print(`${GamePlayer.get(key).coloredName()} team #: ${val}`);
		})
	}

	public changeTeamNumber(p1: player, team: number) {
		SetPlayerTeam(p1, team)
	}

	public setAlliance(p1: player, p2: player, bool: boolean) {
		//TODO: check ally limit
		SetPlayerAlliance(p1, p2, ALLIANCE_PASSIVE, bool)
		SetPlayerAlliance(p1, p2, ALLIANCE_HELP_REQUEST, bool)
		SetPlayerAlliance(p1, p2, ALLIANCE_HELP_RESPONSE, bool)
		SetPlayerAlliance(p1, p2, ALLIANCE_SHARED_XP, bool)
		SetPlayerAlliance(p1, p2, ALLIANCE_SHARED_SPELLS, bool)
		SetPlayerAlliance(p1, p2, ALLIANCE_SHARED_VISION, bool)
		SetPlayerAlliance(p1, p2, ALLIANCE_SHARED_CONTROL, bool)
		//TODO: adv control option check
		SetPlayerAlliance(p1, p2, ALLIANCE_SHARED_ADVANCED_CONTROL, bool)

		if (bool) this.add(p1, p2);
		if (!bool) this.remove(p1, p2);
	}

	private add(p1: player, p2: player) {
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
			}
		}
	}

	public static getInstance() {
		if (this.instance == null) {
			this.instance = new Alliances();
		}
		return this.instance;
	}
}