// import CameraControls from "app/camera-controls";
// import { GamePlayer, PlayerNames, PlayerStatus } from "app/player/player-type";
// import { Trees } from "app/Trees";
// import { UserInterface } from "app/user-interface-type";
// import { PLAYER_COLORS, PLAYER_COLOR_NAMES } from "libs/playerColorData";
// import { Util } from "libs/translators";
// import { HexColors } from "resources/hexColors";
// import { UID } from "resources/unitID";
// import { Players } from "w3ts/globals";
// import { GameStatus } from "./game-status";

// //TODO
// //transport events
// //change colors
// //init kd maps
// //change name after colors
// //promode
// //trees
// //city allocation


// /**
//  * Runs all code that is needed to run at 0.00 seconds
//  */
// export function onLoad() {


//     GamePlayer.fromID.forEach(gPlayer => {
//         if (gPlayer.player == Player(24)) return; //Exclude neutral hostile

//         //TODO: promode, edit below
//         //Fight Bonus Setup
//         gPlayer.initBonusUI(); //DONE LAST ON LOAD
//         SetPlayerColor(gPlayer.player, colors.pop());
//         //TODO: promode, edit below
//         for (let i = 0; i < GamePlayer.fromID.size; i++) {
//             if (GetPlayerColor(gPlayer.player) == PLAYER_COLORS[i]) {
//                 gPlayer.names.color = PLAYER_COLOR_NAMES[i]
//                 SetPlayerName(gPlayer.player, PLAYER_COLOR_NAMES[i])
//             }
//         }

//         //Round.Start - v2
//         if (GetLocalPlayer() == gPlayer.player) {
//             EnableDragSelect(false, true);
//             EnableSelect(false, true);
//         }

//         //Create Player Tools
//         SetUnitPathing(CreateUnit(gPlayer.player, UID.PLAYER_TOOLS, 18750.00, -16200.00, 270), false);

//         //TODO: Round.preRound() - Settings/Promode Check/Observer Check
//         gPlayer.setStatus(PlayerStatus.ALIVE);
//         //TODO: Add to multiboard array

//         //TODO: Allocate cities
//         //TODO: Update city counts
//         //TODO: Update unit counts

//         //TODO: 1 Second timer that has:
//         //Multiboard creation
//         //Turn timer start
//         //Enable selection
//     });
// }