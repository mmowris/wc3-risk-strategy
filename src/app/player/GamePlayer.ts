interface KD {
    kills: number;
    deaths: number;
}

export class GamePlayer {
    public player: player
    public income: number;
    public health: boolean; //true == highest , false == lowest
    public value: boolean; //true == highest , false == lowest
    public kd: Map<string | GamePlayer, KD>;
    public unitCount: number;
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
        this.kd = new Map<string | GamePlayer, KD>();
        this.unitCount = 0;
        this.cities.length = 0;
        this.giveIncome();

        //init kd maps
        //may need to keep track of cities a player owns in the country
    }

    reset() {
        this.kd.clear();
        SetPlayerState(this.player, PLAYER_STATE_RESOURCE_GOLD, 0);

        this.init();
    }

    giveIncome() {
        SetPlayerState(this.player, PLAYER_STATE_RESOURCE_GOLD, GetPlayerState(this.player, PLAYER_STATE_RESOURCE_GOLD) + this.income);
    }

    initFightBonus() {

    }

    processFightBonus() {

    }

    giveFightBonus() {

    }

    onStatusChange() {

    }

    addKills() {

    }

    addDeaths() {

    }

    evalBounty() {

    }

    updateStatus() {
        
    }



    setKills(who: GamePlayer, uID: number) {
        // if (!this.kd.has(this.getKey(who, uID))) {

        //     this.kd.set(this.getKey(who, uID), {
        //         kills: 0,
        //         deaths: 0
        //     })
        // }

        this.kd.get(this.getKey(who, uID)).kills++;
        this.kd.get(this).kills++
        this.kd.get(who).kills++
    }

    getKey(who: GamePlayer, uID: number) {
        return `${who}:${uID}`;
    }
}