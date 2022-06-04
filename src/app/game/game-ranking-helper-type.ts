import { GamePlayer } from "app/player/player-type";
import { UID } from "resources/unitID";
import { File } from "w3ts";
import { defineNumberValue, defineStringValue, setPlayerFlag } from "w3ts-w3mmd";
import { RoundSettings } from "./settings-data";

const setTotalKillsValue = defineNumberValue("Kills Total Value", "high");
const setTotalDeathsValue = defineNumberValue("Deaths Total Value", "high");
const setTotalKills = defineNumberValue("Kills Total", "high");
const setTotalDeaths = defineNumberValue("Deaths Total", "high");
const setTotalSSKills = defineNumberValue("Kills SS", "high");
const setTotalSSDeaths = defineNumberValue("Deaths SS", "high");
const setKDValue = defineNumberValue("Kd Value Ratio", "high");
const setKD = defineNumberValue("Kd Ratio", "high");

const setTurnDied = defineNumberValue("Turn Defeated", "high");

const setGoldTotal = defineNumberValue("Gold Earned", "high");
const setBountyGold = defineNumberValue("Bounty Gold", "high");
const setBonusGold = defineNumberValue("Bonus Gold", "high");

const setEndCities = defineNumberValue("Cities Ended With", "high");
const setMaxCities = defineNumberValue("Most Cities Held", "high");

// const setTotalRiflemenKills = defineNumberValue("Kills - Riflemen", "high");
// const setTotalRiflemenDeaths = defineNumberValue("Deaths - Riflemen", "high");
// const setTotalMedicKills = defineNumberValue("Kills - Medic", "high");
// const setTotalMedicDeaths = defineNumberValue("Deaths - Medic", "high");
// const setTotalMortarKills = defineNumberValue("Kills - Mortar", "high");
// const setTotalMortarDeaths = defineNumberValue("Deaths - Mortar", "high");
// const setTotalRoarerKills = defineNumberValue("Kills - Roarer", "high");
// const setTotalRoarerDeaths = defineNumberValue("Deaths - Roarer", "high");
// const setTotalKnightKills = defineNumberValue("Kills - Knight", "high");
// const setTotalKnightDeaths = defineNumberValue("Deaths - Knight", "high");
// const setTotalGeneralKills = defineNumberValue("Kills - General", "high");
// const setTotalGeneralDeaths = defineNumberValue("Deaths - General", "high");
// const setTotalArtilleryKills = defineNumberValue("Kills - Artillery", "high");
// const setTotalArtilleryDeaths = defineNumberValue("Deaths - Artillery", "high");
// const setTotalTankKills = defineNumberValue("Kills - Tank", "high");
// const setTotalTankDeaths = defineNumberValue("Deaths - Tank", "high");
// const setTotalMarineKills = defineNumberValue("Kills - Marine", "high");
// const setTotalMarineDeaths = defineNumberValue("Deaths - Marine", "high");
// const setTotalCaptainKills = defineNumberValue("Kills - Captain", "high");
// const setTotalCaptainDeaths = defineNumberValue("Deaths - Captain", "high");
// const setTotalAdmiralKills = defineNumberValue("Kills - Admiral", "high");
// const setTotalAdmiralDeaths = defineNumberValue("Deaths - Admiral", "high");
// const setTotalTransportKills = defineNumberValue("Kills - Transport", "high");
// const setTotalTransportDeaths = defineNumberValue("Deaths - Transport", "high");
// const setTotalHeavyTransportKills = defineNumberValue("Kills - Heavy Transport", "high");
// const setTotalHeavyTransportDeaths = defineNumberValue("Deaths - Heavy Transport", "high");
// const setTotalWarshipAKills = defineNumberValue("Kills - Warship A", "high");
// const setTotalWarshipADeaths = defineNumberValue("Deaths - Warship A", "high");
// const setTotalWarshipBKills = defineNumberValue("Kills - Warship B", "high");
// const setTotalWarshipBDeaths = defineNumberValue("Deaths - Warship B", "high");

const setMode = defineStringValue("mode", "track");
//const setCitiesCaptured = defineNumberValue("Cities Captured", "high");
//const setCitiesEndedWith = defineNumberValue("Cities Ended With", "high");
//const setTotalGold = defineNumberValue("Total Gold", "high");
//const setAverageGold = defineNumberValue("Average Gold", "high");

export class GameRankingHelper {
	private static instance: GameRankingHelper;
	private track: boolean;

	constructor() { }

	public static getInstance() {
		if (this.instance == null) {
			this.instance = new GameRankingHelper();
		}
		return this.instance;
	}

	public setData(who: player) {
		//if (!this.track) return;

		const timer: timer = CreateTimer();
		let count: number = 0;

		TimerStart(timer, 0.50, true, () => {
			try {
				if (count > 23) {
					PauseTimer(timer);
					DestroyTimer(timer);
					this.endTracking();
					print("Tracking Complete")
				} else {
					if (GamePlayer.fromPlayer.has(Player(count)) && !GamePlayer.get(Player(count)).isObserving()) {
						try {
							let p: GamePlayer = GamePlayer.get(Player(count));
							setTotalKillsValue(p.player, p.kd.get(p).killValue, "set");
							setTotalDeathsValue(p.player, p.kd.get(p).deathValue, "set");
							setTotalKills(p.player, p.kd.get(p).kills, "set");
							setTotalDeaths(p.player, p.kd.get(p).deaths, "set");
							setTotalSSKills(p.player, p.kd.get(`${UID.BATTLESHIP_SS}`).killValue, "set");
							setTotalSSDeaths(p.player, p.kd.get(`${UID.BATTLESHIP_SS}`).deathValue, "set");

							let num: number = p.kd.get(p).killValue / p.kd.get(p).deathValue;
							num = num * 100
							num = Math.round(num)
							num = num / 100
							setKDValue(p.player, num, "set");

							num = p.kd.get(p).kills / p.kd.get(p).deaths;
							num = num * 100
							num = Math.round(num)
							num = num / 100
							setKD(p.player, num, "set");

							setTurnDied(p.player, p.turnDied, "set");
							
							setGoldTotal(p.player, p.goldTotal, "set");
							setBountyGold(p.player, p.bounty.total, "set");
							setBonusGold(p.player, p.bonus.total, "set");

							setMaxCities(p.player, p.cityData.maxCities, "set");
							setEndCities(p.player, p.cityData.endCities, "set");

							// setTotalRiflemenKills(p.player, p.kd.get(`${UID.RIFLEMEN}`).kills, "set");
							// setTotalRiflemenDeaths(p.player, p.kd.get(`${UID.RIFLEMEN}`).kills, "set");
							// setTotalMedicKills(p.player, p.kd.get(`${UID.MEDIC}`).kills, "set");
							// setTotalMedicDeaths(p.player, p.kd.get(`${UID.MEDIC}`).kills, "set");
							// setTotalMortarKills(p.player, p.kd.get(`${UID.MORTAR}`).kills, "set");
							// setTotalMortarDeaths(p.player, p.kd.get(`${UID.MORTAR}`).kills, "set");
							// setTotalRoarerKills(p.player, p.kd.get(`${UID.ROARER}`).kills, "set");
							// setTotalRoarerDeaths(p.player, p.kd.get(`${UID.ROARER}`).kills, "set");
							// setTotalKnightKills(p.player, p.kd.get(`${UID.KNIGHT}`).kills, "set");
							// setTotalKnightDeaths(p.player, p.kd.get(`${UID.KNIGHT}`).kills, "set");
							// setTotalGeneralKills(p.player, p.kd.get(`${UID.GENERAL}`).kills, "set");
							// setTotalGeneralDeaths(p.player, p.kd.get(`${UID.GENERAL}`).kills, "set");
							// setTotalArtilleryKills(p.player, p.kd.get(`${UID.ARTILLERY}`).kills, "set");
							// setTotalArtilleryDeaths(p.player, p.kd.get(`${UID.ARTILLERY}`).kills, "set");
							// setTotalTankKills(p.player, p.kd.get(`${UID.TANK}`).kills, "set");
							// setTotalTankDeaths(p.player, p.kd.get(`${UID.TANK}`).kills, "set");
							// setTotalMarineKills(p.player, p.kd.get(`${UID.MARINE}`).kills, "set");
							// setTotalMarineDeaths(p.player, p.kd.get(`${UID.MARINE}`).kills, "set");
							// setTotalCaptainKills(p.player, p.kd.get(`${UID.CAPTAIN}`).kills, "set");
							// setTotalCaptainDeaths(p.player, p.kd.get(`${UID.CAPTAIN}`).kills, "set");
							// setTotalAdmiralKills(p.player, p.kd.get(`${UID.ADMIRAL}`).kills, "set");
							// setTotalAdmiralDeaths(p.player, p.kd.get(`${UID.ADMIRAL}`).kills, "set");
							// setTotalTransportKills(p.player, p.kd.get(`${UID.TRANSPORT_SHIP}`).kills, "set");
							// setTotalTransportDeaths(p.player, p.kd.get(`${UID.TRANSPORT_SHIP}`).kills, "set");
							// setTotalHeavyTransportKills(p.player, p.kd.get(`${UID.ARMORED_TRANSPORT_SHIP}`).kills, "set");
							// setTotalHeavyTransportDeaths(p.player, p.kd.get(`${UID.ARMORED_TRANSPORT_SHIP}`).kills, "set");
							// setTotalWarshipAKills(p.player, p.kd.get(`${UID.WARSHIP_A}`).kills, "set");
							// setTotalWarshipADeaths(p.player, p.kd.get(`${UID.WARSHIP_A}`).kills, "set");
							// setTotalWarshipBKills(p.player, p.kd.get(`${UID.WARSHIP_B}`).kills, "set");
							// setTotalWarshipBDeaths(p.player, p.kd.get(`${UID.WARSHIP_B}`).kills, "set");
							setMode(p.player, RoundSettings.mode)
							if (p.player == who /*|| Alliances.getInstance().isAllied(who, p.player)) && RoundSettings.diplomancy != 3*/) {
								setPlayerFlag(p.player, "winner");
							} else {
								setPlayerFlag(p.player, "loser");
							}
						} catch (error) {
							print(`Error for player ${GamePlayer.get(Player(count)).names.acct}\n${error}`)
						}

					}
				}
			} catch (error) {
				print(error)
			}

			count++;
		});

		//this.setMode();
	}

	public trackGame() {
		this.track = true;
	}

	private endTracking() {
		File.write("wc3mt.txt", "wc3mt-GameEnd");
	}
}