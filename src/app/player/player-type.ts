import { PLAYER_COLOR_CODES } from "libs/playerColorData";

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
export const PlayerNames: string[] = [];
export const enum PlayerStatus {
	PLAYING = "|cFF00FFF0Playing|r",
	OBSERVING = "|cFFFFFFFFObserving|r",
	ALIVE = "|cFF00FF00Alive|r",
	NOMAD = "|cFFFE8A0ENmd|r",
	DEAD = "|cFFFF0005Dead|r",
	FORFEIT = "|cFFFFFC01Forfeit|r",
	LEFT = "|cFF65656ALeft|r",
	STFU = "|cfffe890dSTFU |r",
};

export class GamePlayer {
	public player: player;
	public income: number;
	public health: boolean; //true == highest , false == lowest
	public value: boolean; //true == highest , false == lowest
	public kd: Map<string | GamePlayer, KD>;
	public unitCount: number;
	public status: string;
	public bounty: Bounty;
	public bonus: Bonus;
	public names: Names;
	public cities: unit[] = [];

	public static fromString = new Map<string, GamePlayer>(); //Set in constructor
	public static fromID = new Map<number, GamePlayer>(); //Set onLoad

	constructor(who: player) {
		this.player = who;

		this.names = {
			btag: (who == Player(24)) ? "Neutral-Hostile" : GetPlayerName(who),
			acct: "",
			color: "",
			colorIndex: 0
		}

		this.status = (GetPlayerState(this.player, PLAYER_STATE_OBSERVER) > 0) ? PlayerStatus.OBSERVING : PlayerStatus.PLAYING;

		if (GetPlayerController(who) == MAP_CONTROL_COMPUTER) {
			this.names.acct = this.names.btag.split(' ')[0];
		} else {
			this.names.acct = this.names.btag.split('#')[0];
		}

		GamePlayer.fromString.set(this.names.acct, this);

		this.init();
	}

	/**
	 * init data that is saved/reset
	 */
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

		this.kd.set(this, {
			kills: 0,
			deaths: 0
		});

		GamePlayer.fromID.forEach(gPlayer => {
			this.kd.set(gPlayer, {
				kills: 0,
				deaths: 0
			});
		});
	}

	public reset() {
		this.kd.clear();

		//TODO
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
				this.income = 0;

				break;
			case PlayerStatus.FORFEIT:
				this.income = -1;

				break;
			case PlayerStatus.DEAD:
				this.income = -2;

				break;
			case PlayerStatus.LEFT:
				this.income = -3;

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
				kills: 0,
				deaths: 0
			})
		} else {
			this.kd.get(GamePlayer.getKey(victom, GetUnitTypeId(u))).kills += val; //Total of victom player unit specific
		}

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
				deaths: 0
			})
		} else {
			this.kd.get(GamePlayer.getKey(killer, GetUnitTypeId(u))).deaths += val; //Total of victom player unit specific
		}
	}

	public coloredName(): string {
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

	public static getKey(who: GamePlayer, uID: number) {
		return `${who}:${uID}`;
	}
}