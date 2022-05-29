// import { GamePlayer } from "app/player/player-type";
// import { MAX_PLAYERS } from "resources/constants";
// //TODO: refactor this to use a <gameplayer, gameplayer[]> map
// //I can then just track allies of a player
// //Free ally mode can not support team scoreboard
// export class Alliances {
// 	private static instance: Alliances;
// 	private teams: Map<number, GamePlayer[]>;
// 	//TODO: if all humans are on one team, disband team.
// 	constructor() {
// 		this.teams = new Map<number, GamePlayer[]>();
// 		this.setTeams();
// 	}

// 	private setTeams() {
// 		GamePlayer.fromPlayer.forEach(gPlayer => {
// 			if (gPlayer.isNeutral()) return;
// 			if (gPlayer.isObserving()) return;//TODO handle obs, i may need some checks on restarts when a player goes obs -> playing

// 			let teamNum: number = Alliances.getTeamNumber(gPlayer.player);

// 			//print(`${gPlayer.coloredName()} is on team number ${teamNum}`)

// 			if (this.teams.has(teamNum)) {
// 				this.teams.get(teamNum).push(gPlayer);
// 			} else {
// 				this.teams.set(teamNum, [])
// 				this.teams.get(teamNum).push(gPlayer);
// 			}
// 		})

// 		// this.teams.forEach((val: [], key: number) => {
// 		// 	print(`        team #${key} has ${val.length} players`)
// 		// })
// 	}

// 	public setAlliance(p1: player, p2: player, bool: boolean) {
// 		//TODO: in order to fix alot of potential problems, i can simply make it so players can only be on 1 team at a time.
// 		SetPlayerAlliance(p1, p2, ALLIANCE_PASSIVE, bool)
// 		SetPlayerAlliance(p1, p2, ALLIANCE_HELP_REQUEST, bool)
// 		SetPlayerAlliance(p1, p2, ALLIANCE_HELP_RESPONSE, bool)
// 		SetPlayerAlliance(p1, p2, ALLIANCE_SHARED_XP, bool)
// 		SetPlayerAlliance(p1, p2, ALLIANCE_SHARED_SPELLS, bool)
// 		SetPlayerAlliance(p1, p2, ALLIANCE_SHARED_VISION, bool)
// 		SetPlayerAlliance(p1, p2, ALLIANCE_SHARED_CONTROL, bool)
// 		//TODO: adv control option check
// 		SetPlayerAlliance(p1, p2, ALLIANCE_SHARED_ADVANCED_CONTROL, bool)

// 		//TODO: add player to team
// 		//Do i add p2 to p1? or p1 to p2?
// 		//This could depend on case

// 		//TODO: When player wars another player, remove waring player from team
// 		// and make that team unally waring player
// 		if (!bool) this.remove(Alliances.getTeamNumber(p1), GamePlayer.get(p1));
// 	}

// 	public add(team: number, p1: GamePlayer) {
// 		if (this.teams.has(team)) {
// 			this.teams.get(team).push(p1);
// 		} else {
// 			this.teams.set(team, new Array())
// 			this.teams.get(team).push(p1);
// 		}
// 	}

// 	public remove(team: number, p1: GamePlayer) {
// 		if (!this.teams.has(team)) return;
// 		if (this.teams.get(team).indexOf(p1) == -1) return;


// 		this.teams.get(team).splice(this.teams.get(team).indexOf(p1), 1);
// 		if (this.teams.get(team).length == 0) this.teams.delete(team);
// 	}

// 	public resetMap() {
// 		this.teams.clear();
// 	}

// 	public isAllied(p1: GamePlayer, p2: GamePlayer): boolean {
// 		return GetPlayerAlliance(p1.player, p2.player, ALLIANCE_PASSIVE);
// 	}

// 	public unAllyLobby() {
// 		for (let i = 0; i < MAX_PLAYERS; i++) {
// 			for (let j = 0; j < MAX_PLAYERS; j++) {
// 				Alliances.getInstance().setAlliance(Player(i), Player(j), false);
// 			}
// 		}
// 	}

// 	public static getTeamNumber(p1: player): number {
// 		return GetPlayerTeam(p1) + 1;
// 	}

// 	public static getInstance() {
// 		if (this.instance == null) {
// 			this.instance = new Alliances();
// 		}
// 		return this.instance;
// 	}
// }