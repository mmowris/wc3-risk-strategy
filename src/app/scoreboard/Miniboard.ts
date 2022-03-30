// import { PlayerStatus, GamePlayer } from "app/player/player-type";
// import { PLAYER_COLOR_CODES } from "libs/playerColorData";
// import { HexColors } from "resources/hexColors";
// import { Multiboard, MultiboardItem } from "w3ts";
// import { Players } from "w3ts/globals";

// export class MiniBoard extends Multiboard {
//     private columnOneString: string = `${HexColors.TANGERINE}Player|r`
//     private columnTwoString: string = `${HexColors.TANGERINE}Inc|r`
//     private mbItem: MultiboardItem;
//     public totalRows: number;
//     public startRow: number = 2;

//     constructor(rows: number, columns: number) {
//         super();

//         GamePlayer.fromID.forEach(gPlayer => {
//             if (gPlayer.player != Player(24) && gPlayer.isAlive()) {
                
//             }
//         });

//         this.totalRows = Data.PlayersOnSB.length + rows;
//         this.rows = 0;
//         this.columns = columns;

//         for (let i = 0; i < this.totalRows; i++) {
//             this.rows = this.rows + 1;
//         };

//         this.setItemsStyle(true, false);

//         for (let i = 1; i <= this.totalRows; i++) {
//             this.setItemWidth(12.00, i, 1);
//             this.setItemWidth(2.00, i, 2);
//         }

//         this.setItemValue(this.columnOneString, 1, 1);
//         this.setItemValue(this.columnTwoString, 1, 2);

//         this.setItemWidth(12.00, this.totalRows, 1);
//         this.setItemWidth(0.00, this.totalRows, 2);

//         for (let i = 0; i < Data.PlayersOnSB.length; i++) {
//             let pID: number = Data.PlayersOnSB[i].id;
//             let currRow: number = this.startRow + i;

//             this.updateBoard(pID, currRow, 60, true);
//         }

//         this.minimize(true);
//         this.minimize(false);
//         this.display(false);
//     }

//     /**
//      * updateBoard
//      */
//     public updateBoard(pID: number, currRow: number, turnTime: number, updateIncome: boolean = false) {
//         let color: string = Players[pID].isLocal() ? HexColors.TANGERINE : HexColors.WHITE;
//         let timerColor: string = turnTime <= 3 ? HexColors.RED : HexColors.WHITE;

//         this.setItemValue(GamePlayers[pID].displayName, currRow, 1);

//         if (updateIncome && (GamePlayers[pID].isAlive() || GamePlayers[pID].isNomad())) {
//             this.setItemValue(`${color}${GamePlayers[pID].income}|r`, currRow, 2);
//         } else {
//             switch (GamePlayers[pID].status) {
//                 case PlayerStatus.DEAD:
//                     this.setItemValue(`${HexColors.RED}[*]|r`, currRow, 2);

//                     break;
//                 case PlayerStatus.FORFEIT:
//                     this.setItemValue(`${HexColors.TEAL}[*]|r`, currRow, 2);

//                     break;
//                 case PlayerStatus.LEFT:
//                     this.setItemValue(`${HexColors.COAL}[*]|r`, currRow, 2);

//                     break;
//                 case PlayerStatus.STFU:
//                     this.setItemValue(`${HexColors.ORANGE}[*]|r`, currRow, 2);

//                     break;
//                 default:
//                     break;
//             }
//         }

//         this.title = `${GamePlayers[Data.LeaderID].displayName}|r ${GamePlayers[Data.LeaderID].ownedCities.length} / ${Data.CitiesToWin}|r ${HexColors.WHITE}(${timerColor}${turnTime}${HexColors.WHITE})|r`
//     }

//     /**
//      * victoryUpdate
//      */
//     public victoryUpdate(pID: number, currRow: number, vPlayer: GamePlayer) {
//         this.setItemValue(`${PLAYER_COLOR_CODES[GamePlayers[pID].colorIndex]}${GamePlayers[pID].battleTag}`, currRow, 1);

//         if (GamePlayers[pID] == vPlayer) {
//             this.setItemValue(`${HexColors.GREEN}Won|r`, currRow, 2);
//         } else {
//             this.setItemValue(`${HexColors.RED}Lost|r`, currRow, 2);
//         }

//         this.title = `${PLAYER_COLOR_CODES[GamePlayers[Data.LeaderID].colorIndex]}${GamePlayers[Data.LeaderID].battleTag}|r won with ${PLAYER_COLOR_CODES[GamePlayers[Data.LeaderID].colorIndex]}${GamePlayers[Data.LeaderID].ownedCities.length}|r cities! `;
//     }

//     /**
//      * setItemWidth
//      * @param width 
//      * @param row 
//      * @param col 
//      */
//     public setItemWidth(width: number, row: number, col: number) {
//         this.mbItem = new MultiboardItem(this, row, col);
//         this.mbItem.setWidth(width / 100);
//         this.mbItem.destroy();
//         this.mbItem = null;
//     }

//     /**
//      * setItemValue
//      * @param value 
//      * @param row 
//      * @param col 
//      */
//     public setItemValue(value: string, row: number, col: number) {
//         this.mbItem = new MultiboardItem(this, row, col);
//         this.mbItem.setValue(value);
//         this.mbItem.destroy();
//         this.mbItem = null;
//     }
// }