import { CommandProcessor } from "app/commands/command-processor";
import { Game } from "app/game/game-type";
import { addScriptHook, W3TS_HOOK } from "w3ts";

function tsMain() {
	try {
		Game.getInstance();
		CommandProcessor();
	}
	catch (e) {
		print(e);
	}
}

addScriptHook(W3TS_HOOK.MAIN_AFTER, tsMain);

function mainer() {
	SetMapName("Risk Europe")
	// let c: number = 0;
	// let l: number;
	// let f: number = 0;

	// for (const key in _G) {
	// 	if (!l) {
	// 		l = StringHash(key)
	// 	} else {
	// 		let curr = StringHash(key)
	// 		f += BlzBitXor(l, curr);
	// 	}
	// 	c++
	// }
	//Lobby checksum 1097690227
	//File.write("texting.txt", `${f}, ${c}`) //1926189776 game checksum
	// if (c != 1926189776) {
	// 	CreateCorpse(Player(0), UID.ADMIRAL, 5, 5, 270);
	// }
}

addScriptHook(W3TS_HOOK.CONFIG_AFTER, mainer);

// function test() {
// 	CreateCorpse(Player(0), UID.ADMIRAL, 5, 5, 270);
// 	print("test")
// 	SetMapName("testtttt")
// }

// addScriptHook(W3TS_HOOK.CONFIG_BEFORE, test);