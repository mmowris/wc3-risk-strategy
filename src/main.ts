import { Game } from "app/game";
import { Unit } from "w3ts";
import { Players } from "w3ts/globals";
import { addScriptHook, W3TS_HOOK } from "w3ts/hooks";

function tsMain() {
    try {
        Game.getInstance();

        new Unit(Players[0], FourCC('hfoo'), 0.00, -150.00, 270);
        new Unit(Players[0], FourCC('hfoo'), 0.00, -300.00, 270);
        new Unit(Players[0], FourCC('hfoo'), 0.00, -450.00, 270);
        new Unit(Players[0], FourCC('hfoo'), 0.00, -600.00, 270);

        new Unit(Players[1], FourCC('hfoo'), 1000.00, -150.00, 270);
        new Unit(Players[1], FourCC('hfoo'), 1000.00, -300.00, 270);
        new Unit(Players[1], FourCC('hfoo'), 1000.00, -450.00, 270);
        new Unit(Players[1], FourCC('hfoo'), 1000.00, -600.00, 270);

        new Unit(Players[2], FourCC('hfoo'), 2000.00, -150.00, 270);
        new Unit(Players[2], FourCC('hfoo'), 2000.00, -300.00, 270);
        new Unit(Players[2], FourCC('hfoo'), 2000.00, -450.00, 270);
        new Unit(Players[2], FourCC('hfoo'), 2000.00, -600.00, 270);
    }
    catch (e) {
        print(e);
    }
}

addScriptHook(W3TS_HOOK.MAIN_AFTER, tsMain);