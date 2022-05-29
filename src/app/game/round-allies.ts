import { GamePlayer } from "app/player/player-type";

export class Alliances {
	private static instance: Alliances;
	private teams: Map<number, GamePlayer[]>;

	constructor() {
		this.teams = new Map<number, GamePlayer[]>();

		//TODO check alliances and grab them
	}

	public set(p1: player, p2: player, bool: boolean) {
		SetPlayerAlliance(p1, p2, ALLIANCE_PASSIVE, bool)
		SetPlayerAlliance(p1, p2, ALLIANCE_HELP_REQUEST, bool)
		SetPlayerAlliance(p1, p2, ALLIANCE_HELP_RESPONSE, bool)
		SetPlayerAlliance(p1, p2, ALLIANCE_SHARED_XP, bool)
		SetPlayerAlliance(p1, p2, ALLIANCE_SHARED_SPELLS, bool)
		SetPlayerAlliance(p1, p2, ALLIANCE_SHARED_VISION, bool)
		SetPlayerAlliance(p1, p2, ALLIANCE_SHARED_CONTROL, bool)
		//TODO: adv control option check
		SetPlayerAlliance(p1, p2, ALLIANCE_SHARED_ADVANCED_CONTROL, bool)
	}

	public add() {

	}

	public remove() {

	}

	public static getInstance() {
		if (this.instance == null) {
			this.instance = new Alliances();
		}
		return this.instance;
	}
}