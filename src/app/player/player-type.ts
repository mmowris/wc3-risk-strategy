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

// export const BonusBase: number = 10;
export const BonusBase: number = 9;
export const BonusCap: number = 40;
// export const BonusMultiplier: number = 5;
// export const BonusDivisor: number = 1000;

export class GamePlayer {
    public player: player
    public income: number;
    public health: boolean; //true == highest , false == lowest
    public value: boolean; //true == highest , false == lowest
    public kd: Map<string | GamePlayer, KD>;
    public unitCount: number;
    public bounty: Bounty;
    public bonus: Bonus;
    public cities: unit[] = [];


    public static fromString = new Map<string, GamePlayer>();
    public static fromID = new Map<number, GamePlayer>();

    constructor() {
    }

    /**
     * init data that is saved/reset
     */
    init() {
        this.income = 0;
        this.health = false;
        this.value = false;
        if (!this.kd) this.kd = new Map<string | GamePlayer, KD>();
        this.unitCount = 0;
        this.cities.length = 0;
        this.bounty.delta = 0;
        this.bounty.total = 0;

        //TODO init bonus

        this.giveGold();

        //init kd maps
        //may need to keep track of cities a player owns in the country
    }

    reset() {
        this.kd.clear();

        //TODO

        SetPlayerState(this.player, PLAYER_STATE_RESOURCE_GOLD, 0);

        this.init();
    }

    giveGold(val?: number) {
        if (!val) val = this.income;

        SetPlayerState(this.player, PLAYER_STATE_RESOURCE_GOLD, GetPlayerState(this.player, PLAYER_STATE_RESOURCE_GOLD) + val);
    }

    initBonusUI() {
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



    onStatusChange() {

    }

    public onKill(victom: GamePlayer, u: unit) {
        //TODO: Do not update if not alive or nomad
        //TODO: Do not update if victom is owned/allied

        let val: number = GetUnitPointValue(u);

        this.kd.get(this).kills += val; //Total of this player
        this.kd.get(victom).kills += val; //Total of victom player
        this.kd.get(GamePlayer.getKey(victom, GetUnitTypeId(u))).kills += val; //Total of victom player unit specific

        //TODO DO NOT give fight bonus in promode
        this.evalBounty(val);
        this.evalBonus(val);
    }

    public onDeath(killer: GamePlayer, u: unit) {
        //TODO: Do not update if not alive or nomad

        let val: number = GetUnitPointValue(u);

        this.kd.get(this).deaths += val; //Total of this player
        this.kd.get(killer).deaths += val; //Total from killer player
        this.kd.get(GamePlayer.getKey(killer, GetUnitTypeId(u))).deaths += val; //Total from killer player unit specific
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
            let bonusQty: number = Math.floor(this.kd.get(this).kills) + BonusBase

            bonusQty = Math.min(bonusQty, BonusCap);
            this.giveGold(bonusQty);

            if (GetLocalPlayer() == this.player) {
                ClearTextMessages();
            }

            DisplayTimedTextToPlayer(this.player, 0.82, 0.81, 3.00, `Received |cffffcc00${bonusQty}|r gold from |cffff0303Fight Bonus|r!`);
        }

        BlzFrameSetText(BlzGetFrameByName("MyBarExText", GetPlayerId(this.player)), `Fight Bonus: ${this.bonus.delta} / 200`);
        BlzFrameSetValue(this.bonus.bar, (this.bonus.delta / 2));
    }

    // setKills(who: GamePlayer, uID: number) {
    //     // if (!this.kd.has(this.getKey(who, uID))) {

    //     //     this.kd.set(this.getKey(who, uID), {
    //     //         kills: 0,
    //     //         deaths: 0
    //     //     })
    //     // }

    //     this.kd.get(this.getKey(who, uID)).kills++;
    //     this.kd.get(this).kills++
    //     this.kd.get(who).kills++
    // }

    public static getKey(who: GamePlayer, uID: number) {
        return `${who}:${uID}`;
    }
}