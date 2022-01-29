import { Game } from "app/game";
import { addScriptHook, W3TS_HOOK } from "w3ts/hooks";

function tsMain() {
    try {
        Game.getInstance();
    }
    catch (e) {
        print(e);
    }
}

addScriptHook(W3TS_HOOK.MAIN_AFTER, tsMain);