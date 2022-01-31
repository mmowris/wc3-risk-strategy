interface KD {
    kills: number;
    deaths: number;
}

interface Bounty {
    delta: number;
    total: number;
}

export class GamePlayer {
    public player: player
    public income: number;
    public health: boolean; //true == highest , false == lowest
    public value: boolean; //true == highest , false == lowest
    public kd: Map<string | GamePlayer, KD>;
    public unitCount: number;
    public bounty: Bounty;
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

    initFightBonus() {

    }

    processFightBonus() {

    }

    giveFightBonus() {

    }

    onStatusChange() {

    }

    public onKill(victom: GamePlayer, u: unit) {
        //TODO: Do not update if not alive or nomad
        //TODO: Do not update if victom is owned/allied

        let val: number = GetUnitPointValue(u);

        this.kd.get(this).kills+= val; //Total of this player
        this.kd.get(victom).kills+= val; //Total of victom player
        this.kd.get(GamePlayer.getKey(victom, GetUnitTypeId(u))).kills+= val; //Total of victom player unit specific

        //TODO DO NOT give fight bonus in promode
        this.evalBounty(val);
    }

    public onDeath(killer: GamePlayer, u: unit) {
        //TODO: Do not update if not alive or nomad

        let val: number = GetUnitPointValue(u);

        this.kd.get(this).deaths+= val; //Total of this player
        this.kd.get(killer).deaths+= val; //Total from killer player
        this.kd.get(GamePlayer.getKey(killer, GetUnitTypeId(u))).deaths+= val; //Total from killer player unit specific
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