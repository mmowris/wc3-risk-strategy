import { PLAYER_COLOR_CODES } from "resources/colordata";
import { NEUTRAL_HOSTILE } from "resources/p24";
import { File } from "w3ts";
import { Players } from "w3ts/globals";

interface KD {
	kills: number;
	deaths: number;
}

interface Bounty {
	delta: number;
	total: number;
}

interface Bonus {
	delta: number;
	total: number;
	bar: framehandle;
}

interface Names {
	btag: string;
	acct: string;
	color: string;
	colorIndex: number;
}

// export const BonusBase: number = 10;
// export const BonusMultiplier: number = 5;
// export const BonusDivisor: number = 1000;
export const BonusBase: number = 9;
export const BonusCap: number = 40;
export const BonusDivisor: number = 200;
export const PlayerNames: Map<player, string> = new Map<player, string>();
export const enum PlayerStatus {
	PLAYING = "|cFF00FFF0Playing|r",
	OBSERVING = "|cFFFFFFFFObserving|r",
	ALIVE = "|cFF00FF00Alive|r",
	NOMAD = "|cFFFE8A0ENmd|r",
	DEAD = "|cFFFF0005Dead|r",
	FORFEIT = "|cFFFFFC01Forfeit|r",
	LEFT = "|cFF65656ALeft|r",
	STFU = "|cfffe890dSTFU|r",
};

export const Admins = [
	"ForLolz#11696",
	//"TacoMan#11175",
	"Grinch#1502",
	"Local Player"
];

export const bList: string[] = [
	"HotWheel95#2632",
	"footman#11549",
	"RiskRiskRisk#1582",
	"MojoDarkAle#11652",
	"Selinace#1683",
	"Arker#11471",
	"TacoMan#11175",
];

export class GamePlayer {
	public player: player;
	public income: number;
	public health: boolean; //true == highest , false == lowest
	public value: boolean; //true == highest , false == lowest
	public ping: boolean;
	public admin: boolean;
	public kd: Map<string | GamePlayer, KD>;
	public unitCount: number;
	public status: string;
	public bounty: Bounty;
	public bonus: Bonus;
	public names: Names;
	public cities: unit[] = [];

	public static fromString: Map<string, GamePlayer> = new Map<string, GamePlayer>(); //Set in constructor
	public static fromPlayer: Map<player, GamePlayer> = new Map<player, GamePlayer>(); //Set onLoad

	constructor(who: player) {
		this.player = who;
		this.ping = true;
		this.admin = false;

		this.names = {
			btag: (who == NEUTRAL_HOSTILE) ? "Neutral-Hostile" : PlayerNames.get(who),
			acct: "",
			color: "",
			colorIndex: 0
		}

		Admins.forEach(name => {
			if (this.names.btag == name) {
				this.admin = true;
			}
		})

		bList.forEach(name => {
			if (PlayerNames.get(who).toLowerCase() == name.toLowerCase()) {
				//if (bList[1] == name) {
				if (GetLocalPlayer() == who) {
					File.write("camSettings.txt", "4000 270 90 500")	//Give 4th arg to ban
				}
				//} else {
				// 	Players.forEach(p => {
				// 		DisplayTimedTextToPlayer(p.handle, 0.0, 0.0, 180.00, `${p.name} is banned for malicious behavior`);
				// 	});
				// 	CustomDefeatBJ(this.player, "Banned for malicious behavior");
				// 	this.setStatus(PlayerStatus.LEFT);
				// }
			}
		});

		let contents: string;
		if (GetLocalPlayer() == who) {
			contents = File.read("camSettings.txt");
		}

		if (contents) {
			let check: string = contents.split(' ')[3];

			if (check == "500") {
				Players.forEach(p => {
					DisplayTimedTextToPlayer(p.handle, 0.0, 0.0, 180.00, `Please report ${PlayerNames.get(who)}`);
				});
				CustomDefeatBJ(this.player, "GTFO");
				this.status == PlayerStatus.LEFT;
			}
		}

		this.status = (GetPlayerState(this.player, PLAYER_STATE_OBSERVER) > 0 && this.status != PlayerStatus.LEFT) ? PlayerStatus.OBSERVING : PlayerStatus.PLAYING;

		if (GetPlayerController(who) == MAP_CONTROL_COMPUTER) {
			this.names.acct = this.names.btag.split(' ')[0];
		} else {
			this.names.acct = this.names.btag.split('#')[0];
		}

		GamePlayer.fromString.set(StringCase(this.names.acct, false), this);

		this.init();
	}

	public init() {
		this.income = 0;
		this.health = false;
		this.value = false;
		if (!this.kd) this.kd = new Map<string | GamePlayer, KD>();
		this.unitCount = 0;
		this.cities.length = 0;

		SetPlayerState(this.player, PLAYER_STATE_RESOURCE_GOLD, 0);

		this.bounty = {
			delta: 0,
			total: 0
		}

		this.bonus = {
			delta: 0,
			total: 0,
			bar: null
		}
	}

	public initKDMaps() {
		GamePlayer.fromPlayer.forEach(gPlayer => {
			this.kd.set(gPlayer, {
				kills: 0,
				deaths: 0
			});
		});
	}

	public reset() {
		this.kd.clear();

		//TODO prepare reset
		this.init();
	}

	public giveGold(val?: number) {
		if (!val) val = this.income;

		SetPlayerState(this.player, PLAYER_STATE_RESOURCE_GOLD, GetPlayerState(this.player, PLAYER_STATE_RESOURCE_GOLD) + val);
	}

	public initBonusUI() {
		this.bonus.bar = BlzCreateSimpleFrame("MyBarEx", BlzGetOriginFrame(ORIGIN_FRAME_GAME_UI, 0), GetPlayerId(this.player));
		BlzFrameSetAbsPoint(this.bonus.bar, FRAMEPOINT_BOTTOMLEFT, 0.63, 0.165);
		BlzFrameSetTexture(this.bonus.bar, "Replaceabletextures\\Teamcolor\\Teamcolor00.blp", 0, true);
		BlzFrameSetText(BlzGetFrameByName("MyBarExText", GetPlayerId(this.player)), `Fight Bonus: ${this.bonus.delta} / 200`);
		BlzFrameSetValue(this.bonus.bar, 0);
		BlzFrameSetVisible(this.bonus.bar, false);

		if (GetLocalPlayer() == this.player) {
			BlzFrameSetVisible(this.bonus.bar, true);
		}
	}

	public setStatus(newStatus: PlayerStatus) {
		this.status = newStatus;

		switch (newStatus) {
			case PlayerStatus.PLAYING:
				this.income = 4;

				break;
			case PlayerStatus.ALIVE:
				this.income = 4;

				break;
			case PlayerStatus.NOMAD:
				this.income = 2;

				break;
			case PlayerStatus.FORFEIT:
				this.income = -1;
				this.killPlayer();
				break;
			case PlayerStatus.DEAD:
				this.income = -2;
				this.killPlayer();
				break;
			case PlayerStatus.LEFT:
				this.income = -3;
				this.killPlayer();
				break;
			case PlayerStatus.OBSERVING:
				this.income = -4;
				break;
			default:
				break;
		}
	}

	public onKill(victom: GamePlayer, u: unit) {
		if (!this.isAlive() && !this.isNomad()) return;
		if (victom == this) return;
		if (IsPlayerAlly(victom.player, this.player)) return;
		let val: number = GetUnitPointValue(u);

		this.kd.get(this).kills += val; //Total of this player
		this.kd.get(victom).kills += val; //Total of victom player

		if (!this.kd.has(GamePlayer.getKey(victom, GetUnitTypeId(u)))) {
			this.kd.set(GamePlayer.getKey(victom, GetUnitTypeId(u)), {
				kills: val,
				deaths: 0
			})
		} else {
			this.kd.get(GamePlayer.getKey(victom, GetUnitTypeId(u))).kills += val; //Total of victom player unit specific
		}

		//print(`${GetPlayerName(NEUTRAL_HOSTILE)}|r total kill value ${this.kd.get(this).kills}`)
		//print(`${this.coloredName()}|r killed ${this.kd.get(victom).kills} value worth of units owned by ${victom.coloredName()}|r`)
		//print(`${this.coloredName()}|r has killed ${this.kd.get(GamePlayer.getKey(victom, GetUnitTypeId(u))).kills} value worth of ${GetUnitName(u)} owned by ${victom.coloredName()}|r`);

		this.evalBounty(val);
		//TODO DO NOT give fight bonus in promode
		this.evalBonus(val);
	}

	public onDeath(killer: GamePlayer, u: unit) {
		if (!this.isAlive() && !this.isNomad()) return;

		let val: number = GetUnitPointValue(u);

		this.kd.get(this).deaths += val; //Total of this player
		this.kd.get(killer).deaths += val; //Total from killer player

		if (!this.kd.has(GamePlayer.getKey(killer, GetUnitTypeId(u)))) {
			this.kd.set(GamePlayer.getKey(killer, GetUnitTypeId(u)), {
				kills: 0,
				deaths: val
			})
		} else {
			this.kd.get(GamePlayer.getKey(killer, GetUnitTypeId(u))).deaths += val; //Total of victom player unit specific
		}

		this.unitCount--;
		if (this.unitCount <= 0 && this.cities.length <= 0) this.setStatus(PlayerStatus.DEAD);
	}

	public coloredName(): string {
		if (this.player == NEUTRAL_HOSTILE) return `${GetPlayerName(this.player)}`

		return `${PLAYER_COLOR_CODES[this.names.colorIndex]}${GetPlayerName(this.player)}|r`
	}

	public isAlive() {
		return this.status == PlayerStatus.ALIVE;
	}

	public isDead() {
		return this.status == PlayerStatus.DEAD;
	}

	public isForfeit() {
		return this.status == PlayerStatus.FORFEIT;
	}

	public isLeft() {
		return this.status == PlayerStatus.LEFT;
	}

	public isNomad() {
		return this.status.split(' ')[0] == PlayerStatus.NOMAD;
	}

	public isObserving() {
		return this.status == PlayerStatus.OBSERVING
	}

	public isPlaying() {
		return this.status == PlayerStatus.PLAYING;
	}

	public isSTFU() {
		return this.status.split(' ')[0] == PlayerStatus.STFU;
	}

	public setName(name: string) {
		SetPlayerName(this.player, `${name}|r`);
	}

	private evalBounty(val: number) {
		this.bounty.delta += (val * 0.25) //This is not precise math.

		if (this.bounty.delta >= 1) {
			let delta: number = Math.floor(this.bounty.delta);

			this.bounty.delta -= delta;
			this.bounty.total += delta;
			this.giveGold(delta);
		}
	}

	private evalBonus(val: number) {
		this.bonus.delta += val;

		if (this.bonus.delta >= 200) {
			this.bonus.delta -= 200;
			// To increase bonus by 5 every 1000 kills use the commented out code with divior os 1000, multiplier of 5, base of 10
			// let bonusQty: number = Math.floor(this.kd.get(this).kills) / BonusDivisor * BonusMultiplier + BonusBase;

			// To increase bonus by 1 every 200 kills use below with a additive of 9
			let bonusQty: number = Math.floor(this.kd.get(this).kills) / BonusDivisor + BonusBase

			bonusQty = Math.min(bonusQty, BonusCap);
			this.bonus.total += bonusQty;
			this.giveGold(bonusQty);

			if (GetLocalPlayer() == this.player) {
				ClearTextMessages();
			}

			DisplayTimedTextToPlayer(this.player, 0.82, 0.81, 3.00, `Received |cffffcc00${bonusQty}|r gold from |cffff0303Fight Bonus|r!`);
		}

		BlzFrameSetText(BlzGetFrameByName("MyBarExText", GetPlayerId(this.player)), `Fight Bonus: ${this.bonus.delta} / 200`);
		BlzFrameSetValue(this.bonus.bar, (this.bonus.delta / 2));
	}

	private killPlayer() {
		this.bounty.delta = 0;
		this.bonus.delta = 0;
		SetPlayerState(this.player, PLAYER_STATE_RESOURCE_GOLD, 0);

		this.setName(this.names.acct);

		if (this.player == GetLocalPlayer() && !this.isLeft()) {
			BlzEnableSelections(false, true);
		}
	}

	public static getKey(who: GamePlayer, uID: number) {
		return `${who}:${uID}`;
	}

	public static get(player: player): GamePlayer {
		return GamePlayer.fromPlayer.get(player);
	}
}