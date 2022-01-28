import { UserInterface } from "app/user-interface-type";
import { Util } from "libs/translators";
import { HexColors } from "resources/hexColors";
import { GameStatus } from "./gameStatus";

/**
 * Runs all code that is needed to run at 0.00 seconds
 */
export function onLoad() {
    print(`${Util.RandomEnumKey(HexColors)}Game type is:|r ${Util.RandomEnumKey(HexColors)}${GameStatus.getInstance().toString()}|r`);
    UserInterface.onLoad();
}