import { Timer } from "w3ts";
import { onInit } from "./setup/onInit";
import { onLoad } from "./setup/onLoad";

export class Game {
    private static instance: Game;

    constructor() {
        onInit();

        const loadTimer = new Timer();
        loadTimer.start(0.0, false, () => {
            try {
                onLoad();
            }
            catch (e) {
                print(e);
            }
        });
    }

    public static getInstance() {
        if (this.instance == null) {
            this.instance = new Game();
        }
        return this.instance;
    }
}