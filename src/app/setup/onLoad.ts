import CameraControls from "app/camera-controls";
import { GamePlayer, PlayerNames } from "app/player/player-type";
import { UserInterface } from "app/user-interface-type";
import { Util } from "libs/translators";
import { HexColors } from "resources/hexColors";
import { Players } from "w3ts/globals";
import { GameStatus } from "./game-status";

/**
 * Runs all code that is needed to run at 0.00 seconds
 */
export function onLoad() {
    print(`${Util.RandomEnumKey(HexColors)}Game type is:|r ${Util.RandomEnumKey(HexColors)}${GameStatus.getInstance().toString()}|r`);
    UserInterface.onLoad();
    CameraControls.getInstance();

    Players.forEach(player => {
        player.name = PlayerNames.shift();

        if (player.slotState == PLAYER_SLOT_STATE_PLAYING) {
            if (player.id >= 25) return;

            GamePlayer.fromID.set(player.id, new GamePlayer(player.handle));
            //TODO: Add to ping force
            //TODO: update status
        }
    })

    //TODO
    //transport events
    //change colors
    //init kd maps
    //change name after colors
    //promode
    //trees
    //city allocation
    
}