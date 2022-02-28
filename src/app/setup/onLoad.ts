import CameraControls from "app/camera-controls";
import { GamePlayer, PlayerNames } from "app/player/player-type";
import { Trees } from "app/Trees";
import { UserInterface } from "app/user-interface-type";
import { PLAYER_COLORS, PLAYER_COLOR_NAMES } from "libs/playerColorData";
import { Util } from "libs/translators";
import { HexColors } from "resources/hexColors";
import { UID } from "resources/unitID";
import { UTYPE } from "resources/unitTypes";
import { Players } from "w3ts/globals";
import { GameStatus } from "./game-status";

//TODO
//transport events
//change colors
//init kd maps
//change name after colors
//promode
//trees
//city allocation


/**
 * Runs all code that is needed to run at 0.00 seconds
 */
export function onLoad() {
    print(`${Util.RandomEnumKey(HexColors)}Game type is:|r ${Util.RandomEnumKey(HexColors)}${GameStatus.getInstance().toString()}|r`);
    UserInterface.onLoad();
    CameraControls.getInstance();
    Trees.getInstance();

    const colors: playercolor[] = [];
    let tracker: number = 0;

    Players.forEach(player => {
        player.name = PlayerNames.shift();

        if (player.slotState == PLAYER_SLOT_STATE_PLAYING) {
            if (player.id >= 25) return; //Exclude ai that is not neutral hostile

            GamePlayer.fromID.set(player.id, new GamePlayer(player.handle));
            //TODO: Add to ping force
            //TODO: update status

            if (player.id >= 24) return; //Exclude neutral hostile

            colors.push(PLAYER_COLORS[tracker]);
            tracker++;
        }
    })

    //Randomize Colors and Change names

    Util.ShuffleArray(colors);

    GamePlayer.fromID.forEach(val => {
        if (val.player != Player(24)) { //Exclude neutral hostile

            //TODO: promode, edit below
            SetPlayerColor(val.player, colors.pop());
            //TODO: promode, edit below
            for (let i = 0; i < GamePlayer.fromID.size; i++) {
                if (GetPlayerColor(val.player) == PLAYER_COLORS[i]) {
                    val.names.color = PLAYER_COLOR_NAMES[i]
                    SetPlayerName(val.player, PLAYER_COLOR_NAMES[i])
                }
            }

            //Round.Start
            if (GetLocalPlayer() == val.player) {
                EnableDragSelect(false, true);
                EnableSelect(false, true);
            }

            CreateUnit(val.player, UID.PLAYER_TOOLS, 18750.00, -16200.00, 270)

            //TODO: Init fight bonus
            //TODO: Update cam if needed
            //TODO: Update status
            //TODO: Add to multiboard array

            //TODO: Allocate cities
            //TODO: Update city counts
            //TODO: Update unit counts

            //TODO: 1 Second timer that has:
            //Multiboard creation
            //Turn timer start
            //Enable selection
        }
    });
}