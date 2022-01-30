import { MapPlayer } from "w3ts";

export class Names {
    bTag: string;
    acct: string;
    hidden: string;
    display: string;

    constructor(who: MapPlayer) {
        this.bTag = who.name;
    }
}