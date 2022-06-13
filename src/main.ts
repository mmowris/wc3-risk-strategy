import { Game } from "app/game/game-type";
import { addScriptHook, W3TS_HOOK } from "w3ts";
import { stopInit } from "w3ts-w3mmd";

function tsMain() {
	try {
		Game.getInstance();
	}
	catch (e) {
		print(e);
	}
}

addScriptHook(W3TS_HOOK.MAIN_AFTER, tsMain);

function fixMapName() {
	SetMapName("Risk Europe");
	stopInit();
}

addScriptHook(W3TS_HOOK.CONFIG_AFTER, fixMapName);