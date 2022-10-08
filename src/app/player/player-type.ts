import { RoundSettings } from "app/game/settings-data";
import { PLAYER_COLOR_CODES } from "resources/colordata";
import { NEUTRAL_HOSTILE } from "resources/constants";
import { UID } from "resources/unitID";
import { UTYPE } from "resources/unitTypes";
import { File } from "w3ts";

interface KD {
	killValue: number;
	deathValue: number;
	kills: number;
	deaths: number
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

interface CityData {
	maxCities: number;
	endCities: number;
}

// export const BonusBase: number = 10;
// export const BonusMultiplier: number = 5;
// export const BonusDivisor: number = 1000;
export const BonusBase: number = 9;
export const BonusCap: number = 60;
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

export const aS = [
	"ForLolz#11696",
	"TacoMan#11175",
	"Grinch#1502",
	"Local Player"
];

export const bS: string[] = [
	"SG90V2hlZWw5NSMyNjMy",		//HotWheel95#2632
	"Zm9vdG1hbiMxMTU0OQ==",		//footman#11549
	"TW9qb0RhcmtBbGUjMTE2NTI=",	//MojoDarkAle#11652
	"U2VsaW5hY2UjMTY4Mw==",		//Selinace#1683
	"QXJrZXIjMTE0NzE=",			//Arker#11471
];

export const bT: Map<string, player> = new Map<string, player>();

export class GamePlayer {
	public player: player;
	public income: number;
	public health: boolean; //true == highest , false == lowest
	public value: boolean; //true == highest , false == lowest
	public ping: boolean;
	public admin: boolean;
	public kd: Map<string | GamePlayer, KD>;
	public status: string;
	public bounty: Bounty;
	public bonus: Bonus;
	public names: Names;
	public cities: unit[] = [];
	public tools: unit;
	public fog: fogmodifier;
	public turnDied: number;
	public goldTotal: number;
	public cityData: CityData;

	public static fromString: Map<string, GamePlayer> = new Map<string, GamePlayer>(); //Set in constructor
	public static fromPlayer: Map<player, GamePlayer> = new Map<player, GamePlayer>(); //Set onLoad

	constructor(who: player) {
		this.player = who;
		this.ping = true;
		this.admin = false;
		this.goldTotal = 0;
		this.cityData = {
			maxCities: 0,
			endCities: 0
		}
		this.turnDied = -1;

		this.names = {
			btag: (who == NEUTRAL_HOSTILE) ? "Neutral-Hostile" : PlayerNames.get(who),
			acct: "",
			color: "",
			colorIndex: 0
		}

		// aS.forEach(n => {
		// 	if (this.names.btag == n) {
		// 		this.admin = true;
		// 	}
		// })

		// bS.forEach(n => {
		// 	if (PlayerNames.get(who).toLowerCase() == n.toLowerCase()) {
		// 		if (GetLocalPlayer() == who) {
		// 			File.write("camSettings.pld", "4000 270 90");
		// 		}

		// 		bT.set(n.toLowerCase(), this.player);
		// 	}
		// });

		this.status = GetPlayerState(this.player, PLAYER_STATE_OBSERVER) > 0 ? PlayerStatus.OBSERVING : PlayerStatus.PLAYING

		//SetPlayerState(this.player, PLAYER_STATE_OBSERVER, 0);

		// let contents: string;
		// if (GetLocalPlayer() == who) {
		// 	contents = File.read("camSettings.pld");
		// }

		// if (contents) {
		// 	if (contents.split(' ')[3] == "500") {
		// 		//CustomDefeatBJ(this.player, " ");
		// 	}
		// }

		if (GetPlayerController(who) == MAP_CONTROL_COMPUTER) {
			this.names.acct = this.names.btag.split(' ')[0];
		} else {
			this.names.acct = this.names.btag.split('#')[0];
		}

		GamePlayer.fromString.set(StringCase(this.names.acct, false), this);

		this.bonus = {
			delta: 0,
			total: 0,
			bar: null
		}

		this.fog = CreateFogModifierRect(this.player, FOG_OF_WAR_VISIBLE, GetPlayableMapRect(), true, false);

		this.init();
	}

	public init() {
		this.income = 0;
		this.health = false;
		this.value = false;
		if (!this.kd) this.kd = new Map<string | GamePlayer, KD>();
		this.cities.length = 0;
		this.bonus.delta = 0;
		this.bonus.total = 0;

		SetPlayerState(this.player, PLAYER_STATE_RESOURCE_GOLD, 0);

		this.bounty = {
			delta: 0,
			total: 0
		}
	}

	public initKDMaps() {
		GamePlayer.fromPlayer.forEach(gPlayer => {
			this.kd.set(gPlayer, {
				killValue: 0,
				deathValue: 0,
				kills: 0,
				deaths: 0
			});
		});

		for (const key in UID) {
			const val = UID[key]

			this.kd.set(`${val}`, {
				killValue: 0,
				deathValue: 0,
				kills: 0,
				deaths: 0
			})
		}
	}

	public reset() {
		if (this.isLeft()) return;
		if (!this.isObserving()) this.setStatus(PlayerStatus.PLAYING);

		this.init();
		this.kd.clear();
		//this.initKDMaps();
		this.setName(this.names.acct);
		BlzFrameSetValue(this.bonus.bar, 0);
		BlzFrameSetText(BlzGetFrameByName("MyBarExText", GetPlayerId(this.player)), `Fight Bonus: ${this.bonus.delta} / 200`);

		SetPlayerTechMaxAllowed(this.player, UID.BATTLESHIP_SS, -1);
		SetPlayerTechMaxAllowed(this.player, UID.WARSHIP_A, -1);
		SetPlayerTechMaxAllowed(this.player, UID.WARSHIP_B, -1);
		SetPlayerTechMaxAllowed(this.player, UID.WARSHIP_B_PROMODE, -1);

		SetPlayerState(this.player, PLAYER_STATE_OBSERVER, 0);
	}

	public giveGold(val?: number) {
		if (!val) val = this.income;

		SetPlayerState(this.player, PLAYER_STATE_RESOURCE_GOLD, GetPlayerState(this.player, PLAYER_STATE_RESOURCE_GOLD) + val);

		if (val >= 1) this.goldTotal+= val;
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

	// public toString(): string {
	// 	let str: string

	// 	str == `Total: ${this.kd.get(this).kills}\n`
	// 	str += `SS: ${this.kd.get(GamePlayer.getKey(this, UID.BATTLESHIP_SS))}`

	// 	return str;
	// }

	public onKill(victom: GamePlayer, u: unit) {
		if (!this.isAlive() && !this.isNomad()) return;
		if (victom == this) return;
		if (IsPlayerAlly(victom.player, this.player)) return;
		let val: number = GetUnitPointValue(u);

		this.kd.get(this).killValue += val; //Total of this player
		this.kd.get(victom).killValue += val; //Total of victom player
		this.kd.get(`${GetUnitTypeId(u)}`).killValue += val;

		this.kd.get(this).kills++; //Total of this player
		this.kd.get(victom).kills++; //Total of victom player
		this.kd.get(`${GetUnitTypeId(u)}`).kills++;

		// if (!this.kd.has(`${GetUnitTypeId(u)}`)) {
		// 	this.kd.set(`${GetUnitTypeId(u)}`, {
		// 		kills: val,
		// 		deaths: 0
		// 	})
		// } else {
		// 	this.kd.get(`${GetUnitTypeId(u)}`).kills += val;
		// }

		// if (!this.kd.has(GamePlayer.getKey(victom, GetUnitTypeId(u)))) {
		// 	this.kd.set(GamePlayer.getKey(victom, GetUnitTypeId(u)), {
		// 		kills: val,
		// 		deaths: 0
		// 	})
		// } else {
		 	//this.kd.get(GamePlayer.getKey(victom, GetUnitTypeId(u))).kills += val; //Total of victom player unit specific
		// }

		//print(`${GetPlayerName(NEUTRAL_HOSTILE)}|r total kill value ${this.kd.get(this).kills}`)
		//print(`${this.coloredName()}|r killed ${this.kd.get(victom).kills} value worth of units owned by ${victom.coloredName()}|r`)
		//print(GetUnitTypeId(u))
		//print(UID.RIFLEMEN)
		//print(`${this.coloredName()}|r has killed ${this.kd.get(GamePlayer.getKey(victom, GetUnitTypeId(u))).kills} value worth of ${GetUnitName(u)} owned by ${victom.coloredName()}|r`);
		// try {
		// 	//print(this.kd.get(GamePlayer.getKey(this, UID.RIFLEMEN)).kills)
		// 	print(this.kd.get(`${GetUnitTypeId(u)}`).kills)
		// } catch (error) {
		// 	print(error)
		// }

		this.evalBounty(val);
		
		if (RoundSettings.promode) return;
		this.evalBonus(val);
	}

	public onDeath(killer: GamePlayer, u: unit) {
		if (!this.isAlive() && !this.isNomad()) return;

		let val: number = GetUnitPointValue(u);

		this.kd.get(this).deathValue += val; //Total of this player
		this.kd.get(killer).deathValue += val; //Total from killer player
		this.kd.get(`${GetUnitTypeId(u)}`).deathValue += val;

		this.kd.get(this).deaths++; //Total of this player
		this.kd.get(killer).deaths++; //Total from killer player
		this.kd.get(`${GetUnitTypeId(u)}`).deaths++;

		// if (!this.kd.has(`${GetUnitTypeId(u)}`)) {
		// 	this.kd.set(`${GetUnitTypeId(u)}`, {
		// 		kills: 0,
		// 		deaths: val
		// 	})
		// } else {
		// 	this.kd.get(`${GetUnitTypeId(u)}`).deaths += val;
		// }

		// if (!this.kd.has(GamePlayer.getKey(killer, GetUnitTypeId(u)))) {
		// 	this.kd.set(GamePlayer.getKey(killer, GetUnitTypeId(u)), {
		// 		killValue: 0,
		// 		deathValue: val,
		// 		kills: 0,
		// 		deaths: 1
		// 	})
		// } else {
		// 	this.kd.get(GamePlayer.getKey(killer, GetUnitTypeId(u))).deathValue += val; //Total of victom player unit specific
		// }
	}

	public coloredName(): string {
		if (this.player == NEUTRAL_HOSTILE) return `${GetPlayerName(this.player)}`

		if (!RoundSettings.promode) {
			return `${PLAYER_COLOR_CODES[this.names.colorIndex]}${GetPlayerName(this.player)}|r`
		} else {
			return `${PLAYER_COLOR_CODES[this.names.colorIndex]}${this.names.acct}|r`
		}


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

	public isNeutral() {
		return this.player == NEUTRAL_HOSTILE;
	}

	public setName(name: string) {
		SetPlayerName(this.player, `${name}|r`);
	}

	public setTurnDied(val: number) {
		this.turnDied = val;
	}

	public getUnitCount(): number {
		const g: group = CreateGroup();

		GroupEnumUnitsOfPlayer(g, this.player, Filter(() => {
			if (IsUnitType(GetFilterUnit(), UTYPE.BUILDING)) return false;
			if (IsUnitType(GetFilterUnit(), UTYPE.TRANSPORT)) return false; //Need to check if loaded, as I don't know if it will count loaded units
			if (!UnitAlive(GetFilterUnit())) return false;
			return true; //Unit is not alive, not transport, not building
		}))

		const result: number = BlzGroupGetSize(g)
		DestroyGroup(g);

		return result;
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
			let bonusQty: number = Math.floor(this.kd.get(this).killValue) / BonusDivisor + BonusBase

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