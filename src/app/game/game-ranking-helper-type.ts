import { GamePlayer } from "app/player/player-type";
import { UID } from "resources/unitID";
import { File } from "w3ts";
import { defineNumberValue, emitCustom, setPlayerFlag } from "w3ts-w3mmd";

const setTotalKills = defineNumberValue("Kills", "high");
const setTotalDeaths = defineNumberValue("Deaths", "high");
const setTotalSSKills = defineNumberValue("SS Kills", "high");
const setTotalSSDeaths = defineNumberValue("SS Deaths", "high");
//const setCitiesCaptured = defineNumberValue("Cities Captured", "high");
//const setCitiesEndedWith = defineNumberValue("Cities Ended With", "high");
//const setTotalGold = defineNumberValue("Total Gold", "high");
//const setAverageGold = defineNumberValue("Average Gold", "high");


export class GameRankingHelper {
	private static instance: GameRankingHelper;

	constructor() { }

	public static getInstance() {
		if (this.instance == null) {
			this.instance = new GameRankingHelper();
		}
		return this.instance;
	}

	public setMode() {
		emitCustom("mode", "FFA")
	}

	public endTracking() {
		File.write("wc3mt.txt", "wc3mt-GameEnd");
	}

	public setLoser(who: player) {
		setPlayerFlag(who, "loser");
	}

	public setWinner(who: player) {
		setPlayerFlag(who, "winner");
	}

	public setData(who: GamePlayer) {
		setTotalKills(who.player, who.kd.get(who).kills, "set");
		setTotalDeaths(who.player, who.kd.get(who).deaths, "set");
		setTotalSSKills(who.player, who.kd.get(GamePlayer.getKey(who, UID.BATTLESHIP_SS )).kills)
		setTotalSSDeaths(who.player, who.kd.get(GamePlayer.getKey(who, UID.BATTLESHIP_SS )).deaths)
	}

	public setkillsData(who: GamePlayer, key: string) {
		emitCustom(`${who.names.btag} kills`, "") //always falls under 32 char limit
	}
}