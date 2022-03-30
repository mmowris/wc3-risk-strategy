// import { GamePlayer } from "app/player/player-type"
// import { PLAYER_COLOR_CODES } from "libs/playerColorData"
// import { HexColors } from "resources/hexColors"
// import { Multiboard, MultiboardItem } from "w3ts"
// import { Players } from "w3ts/globals"

// export class StandardBoard extends Multiboard {
//     private columnOneString: string = `${HexColors.TANGERINE}Player|r`
//     private columnTwoString: string = `${HexColors.TANGERINE}Inc|r`
//     private columnCString: string = `${HexColors.TANGERINE}C|r`
//     private columnThreeString: string = `${HexColors.TANGERINE}K|r`
//     private columnFourString: string = `${HexColors.TANGERINE}D|r`
//     private columnFiveString: string = `${HexColors.TANGERINE}Status|r`
//     private mbItem: MultiboardItem;
//     public totalRows: number;
//     public startRow: number = 2;

//     constructor(rows: number, columns: number) {
//         super();
        
//         this.totalRows = Data.PlayersOnSB.length + rows;
//         this.rows = 0;
//         this.columns = columns;

//         for (let i = 0; i < this.totalRows; i++) {
//             this.rows = this.rows + 1;
//         };

//         this.setItemsStyle(true, false);

//         for (let i = 1; i <= this.totalRows; i++) {
//             this.setItemWidth(8.00, i, 1);
//             this.setItemWidth(2.50, i, 2);
//             this.setItemWidth(2.50, i, 3);
//             this.setItemWidth(3.50, i, 4);
//             this.setItemWidth(3.50, i, 5);
//             this.setItemWidth(4.50, i, 6);
//         }

//         this.setItemValue(this.columnOneString, 1, 1);
//         this.setItemValue(this.columnTwoString, 1, 2);
//         this.setItemValue(this.columnCString, 1, 3);
//         this.setItemValue(this.columnThreeString, 1, 4);
//         this.setItemValue(this.columnFourString, 1, 5);
//         this.setItemValue(this.columnFiveString, 1, 6);

//         this.setItemWidth(20.00, this.totalRows, 1);
//         this.setItemWidth(0.00, this.totalRows, 2);
//         this.setItemWidth(0.00, this.totalRows, 3);
//         this.setItemWidth(0.00, this.totalRows, 4);
//         this.setItemWidth(0.00, this.totalRows, 5); 
//         this.setItemWidth(0.00, this.totalRows, 6);

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
//         GamePlayers[pID].ownedCities.length
//         this.setItemValue(GamePlayers[pID].displayName, currRow, 1);
//         this.setItemValue(`${color}${GamePlayers[pID].ownedCities.length}`, currRow, 3);
//         this.setItemValue(`${color}${GamePlayers[pID].kills}`, currRow, 4);
//         this.setItemValue(`${color}${GamePlayers[pID].deaths}`, currRow, 5);
//         this.setItemValue(GamePlayers[pID].status, currRow, 6);

//         if (updateIncome) {
//             this.setItemValue(`${color}${GamePlayers[pID].income}|r`, currRow, 2);
//         }

//         this.title = `${GamePlayers[Data.LeaderID].displayName}|r ${GamePlayers[Data.LeaderID].ownedCities.length} / ${Data.CitiesToWin}|r ${HexColors.RED}-|r Turn Time: ${timerColor}${turnTime}|r`
//     }

//     /**
//      * victoryUpdate
//      */
//     public victoryUpdate(pID: number, currRow: number, vPlayer: GamePlayer) {
//         this.setItemValue(`${PLAYER_COLOR_CODES[GamePlayers[pID].colorIndex]}${GamePlayers[pID].battleTag}`, currRow, 1);
//         //this.setItemValue("", currRow, 2);

//         if (GamePlayers[pID] == vPlayer) {
//             this.setItemValue(`${HexColors.GREEN}Winner|r`, currRow, 6);
//         } else {
//             this.setItemValue(`${HexColors.RED}Loser|r`, currRow, 6);
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