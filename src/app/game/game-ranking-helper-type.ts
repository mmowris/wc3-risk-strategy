// import { GamePlayer } from "app/player/player-type";
// import { MessageAll } from "libs/utils";
// import { HexColors } from "resources/hexColors";
// import { UID } from "resources/unitID";
// import { File } from "w3ts";
// import { defineNumberValue, defineStringValue, init, setPlayerFlag } from "w3ts-w3mmd";
// import { RoundSettings } from "./settings-data";

// const setKillsValue = defineNumberValue("Value Kills", "high");
// const setDeathsValue = defineNumberValue("Value Deaths", "high");
// const setSSKillValue = defineNumberValue("Value SS Kills", "high");
// const setSSDeathValue = defineNumberValue("Value SS Deaths", "high");
// const setKDValue = defineNumberValue("Value KD", "high");

// const setKillsTotal = defineNumberValue("Total Kills", "high");
// const setDeathsTotal = defineNumberValue("Total Deaths", "high");
// const setSSKillTotal = defineNumberValue("Total SS Kills", "high");
// const setSSDeathTotal = defineNumberValue("Total SS Deaths", "high");
// const setKDTotal = defineNumberValue("Total KD", "high");

// const setGoldTotal = defineNumberValue("Gold Earned", "high");
// const setBountyGold = defineNumberValue("Gold Bounty", "high");
// const setBonusGold = defineNumberValue("Gold Bonus", "high");

// const setEndCities = defineNumberValue("End Cities", "high");
// const setMaxCities = defineNumberValue("Most Cities", "high");

// const setTurnDied = defineNumberValue("Last Turn", "high");

// const setMode = defineStringValue("mode", "track");
// //const setCitiesCaptured = defineNumberValue("Cities Captured", "high");

// export class GameRankingHelper {
// 	private static instance: GameRankingHelper;
// 	public track: boolean;

// 	constructor() { }

// 	public static getInstance() {
// 		if (this.instance == null) {
// 			this.instance = new GameRankingHelper();
// 		}
// 		return this.instance;
// 	}

// 	public setData(who: player) {
// 		if (!this.track) return;

// 		init();

// 		const preTimer: timer = CreateTimer();
// 		TimerStart(preTimer, 5.00, false, () => {
// 			const timer: timer = CreateTimer();
// 			let count: number = 0;
// 			MessageAll(true, `Saving game data`, 0, 0);
// 			TimerStart(timer, 1.00, true, () => {
// 				try {
// 					if (count > 23) {
// 						PauseTimer(timer);
// 						DestroyTimer(timer);
// 						this.endTracking();
// 					} else {
// 						if (GamePlayer.fromPlayer.has(Player(count)) && !GamePlayer.get(Player(count)).isObserving()) {
// 							try {
// 								let p: GamePlayer = GamePlayer.get(Player(count));
// 								MessageAll(false, `Saving Data for ${p.names.acct}`, 0, 0);
// 								setKillsValue(p.player, p.kd.get(p).killValue, "set");
// 								setDeathsValue(p.player, p.kd.get(p).deathValue, "set");
// 								setKillsTotal(p.player, p.kd.get(p).kills, "set");
// 								setDeathsTotal(p.player, p.kd.get(p).deaths, "set");
// 								setSSKillValue(p.player, p.kd.get(`${UID.BATTLESHIP_SS}`).killValue, "set");
// 								setSSDeathValue(p.player, p.kd.get(`${UID.BATTLESHIP_SS}`).deathValue, "set");
// 								setSSKillTotal(p.player, p.kd.get(`${UID.BATTLESHIP_SS}`).kills, "set");
// 								setSSDeathTotal(p.player, p.kd.get(`${UID.BATTLESHIP_SS}`).deaths, "set");

// 								let num: number = p.kd.get(p).killValue / p.kd.get(p).deathValue;
// 								num = num * 100
// 								num = Math.round(num)
// 								num = num / 100
// 								setKDValue(p.player, num, "set");

// 								num = p.kd.get(p).kills / p.kd.get(p).deaths;
// 								num = num * 100
// 								num = Math.round(num)
// 								num = num / 100
// 								setKDTotal(p.player, num, "set");

// 								setTurnDied(p.player, p.turnDied, "set");

// 								setGoldTotal(p.player, p.goldTotal, "set");
// 								setBountyGold(p.player, p.bounty.total, "set");
// 								setBonusGold(p.player, p.bonus.total, "set");

// 								setMaxCities(p.player, p.cityData.maxCities, "set");
// 								setEndCities(p.player, p.cityData.endCities, "set");

// 								setMode(p.player, RoundSettings.mode)
// 								if (p.player == who /*|| Alliances.getInstance().isAllied(who, p.player)) && RoundSettings.diplomancy != 3*/) {
// 									setPlayerFlag(p.player, "winner");
// 								} else {
// 									setPlayerFlag(p.player, "loser");
// 								}
// 								MessageAll(false, `Data saved for ${p.names.acct}`, 0, 0);
// 							} catch (error) {
// 								print(`Error for player ${GamePlayer.get(Player(count)).names.acct}\n${error}`)
// 							}

// 						}
// 					}
// 				} catch (error) {
// 					print(error)
// 				}

// 				count++;
// 			});

// 			MessageAll(true, `Finished Saving Data`, 0, 0);
// 			MessageAll(false, `${HexColors.TANGERINE}This game was ranked|r\n${HexColors.GREEN}wc3stats.com/risk-europe|r\nYou can find rankings at the site above!`, 0, 0);
// 			MessageAll(false, `${HexColors.TANGERINE}You can download the official version on the discord!|r\n${HexColors.GREEN}Discord Link:|r discord.me/risk`, 0, 0);
// 		})
// 	}

// 	public trackGame() {
// 		this.track = true;
// 	}

// 	public endTracking() {
// 		File.write("wc3mt.txt", "wc3mt-GameEnd");
// 	}
// }