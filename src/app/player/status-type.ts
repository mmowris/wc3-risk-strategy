export const enum PlayerStatus {
    PLAYING = "|cFF00FFF0Playing|r",
    OBSERVING = "|cFFFFFFFFObserving|r",
    ALIVE = "|cFF00FF00Alive|r",
    NOMAD = "|cFFFE8A0ENomad|r",
    DEAD = "|cFFFF0005Dead|r",
    FORFEIT = "|cFFFFFC01Forfeit|r",
    LEFT = "|cFF65656ALeft|r",
    STFU = "|cfffe890dSTFU |r",
};

export class Status {
    status: string;

    constructor() {
        this.status = "";
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
        return this.status == PlayerStatus.NOMAD;
    }

    public isObserving() {
        return this.status == PlayerStatus.OBSERVING
    }

    public isPlaying() {
        return this.status == PlayerStatus.PLAYING;
    }

    public isSTFU() {
        return this.status == PlayerStatus.STFU;
    }
}