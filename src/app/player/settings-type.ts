export class Settings {
    camera: number;
    highHealth: Boolean;
    highValue: Boolean;
    showPings: Boolean;

    constructor() {
        this.camera = 4000;
        this.highHealth = false;
        this.highValue = false;
        this.showPings = true;
    }
}