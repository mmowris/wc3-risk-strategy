// import { Timer } from "w3ts";

// export class TurnTimer {
//     private static turnTimer: Timer = new Timer();
//     private static turnLength: number = 60;2
//     public static currentTime: number = TurnTimer.turnLength;
//     public static turnNumber: number = 1;
//     public static fogCounter: number = -1;

//     constructor() { }

//     /**
//      * start
//      */
//     public static start() {
//         this.currentTime = this.turnLength;

//         this.turnTimer.start(1.00, true, () => {
//             if (this.currentTime == this.turnLength) {
//                 this.everySixtySeconds();
//             } else {
//                 this.everySecond();
//             }

//             this.currentTime--;

//             if (this.currentTime == 0) {
//                 this.currentTime = this.turnLength;
//                 this.turnNumber++;
//             }
//         })
//     }

//     /**
//      * everySixtySeconds
//      */
//     private static everySixtySeconds() {
//         //Check Victory
//         //Stop if round stopped
//         //Sort players for scoreboard
//         //Give Income
//         //Display City Warning
//         //Give spawns
//         //Update scoreboards
//         //Run everySecond()
//         if (GamePlayers[Data.LeaderID].ownedCities.length >= Data.CitiesToWin) {
//             Victory(GamePlayers[Data.LeaderID]);
//         }

//         if (!Data.RoundInProgress) {
//             return this.stop();
//         }

//         if (Data.NightFog) {
//             this.fogCounter++;
            
//             if (this.fogCounter == 2) {
//                 SetTimeOfDay(24.00);
//                 FogEnable(true);

//                 GamePlayers.forEach(gPlayer => {
//                     if (gPlayer.isObserving() && gPlayer.player.isLocal()) {
//                         FogEnable(false);
//                     }
//                 });

//             } else if (this.fogCounter == 4) {
//                 SetTimeOfDay(12.00);
//                 FogEnable(false);
//                 this.fogCounter = 0;
//             }
//         }

//         Utils.sortPlayers();
        
//         GamePlayers.forEach(gPlayer => {
//             if (gPlayer.isAlive() || gPlayer.isNomad()) {
//                 gPlayer.giveIncome();
//             }

//             if (gPlayer.ownedCities.length >= Data.CitiesToWin * 0.70) {
//                 Messages.playerCityWarning(gPlayer);
//             }
//         });

//         Spawners.forEach(spawner => {
//             if (spawner.owner != Players[24]) {
//                 spawner.spawnUnits();
//             }
//         });

//         for (let i = 0; i < Data.PlayersOnSB.length; i++) {
//             let pID = Data.PlayersOnSB[i].id;
//             let currRow: number = Multiboards.Standard.startRow + i;
            
//             Multiboards.Standard.updateBoard(pID, currRow, this.currentTime, true);
//             Multiboards.Mini.updateBoard(pID, currRow, this.currentTime, true);
//         }

//         this.everySecond(false);
//     }

//     /**
//      * everySecond
//      */
//     private static everySecond(updateBoard: boolean = true) {
//         //Stop if round is over
//         //Update scoreboard
//         //Tick & Timer color change for <= 3 seconds
//         //Update resource frames

//         if (!Data.RoundInProgress) {
//             return this.stop();
//         }

//         if (updateBoard) {
//             for (let i = 0; i < Data.PlayersOnSB.length; i++) {
//                 let pID = Data.PlayersOnSB[i].id;
//                 let currRow: number = Multiboards.Standard.startRow + i;
                
//                 Multiboards.Standard.updateBoard(pID, currRow, this.currentTime);
//                 Multiboards.Mini.updateBoard(pID, currRow, this.currentTime);
//             }
//         }

//         let upkeepFrame: framehandle = BlzGetFrameByName("ResourceBarUpkeepText", 0);
//         let foodFrame: framehandle = BlzGetFrameByName("ResourceBarSupplyText", 0);
//         let upkeepString: string = `${this.currentTime}`;

//         if (this.currentTime <= 3) {
//             Utils.globalSound("Sound\\Interface\\BattleNetTick.flac");
//             upkeepString = `${HexColors.RED}${this.currentTime}`;
//         }

//         BlzFrameSetText(upkeepFrame, upkeepString);
//         BlzFrameSetText(foodFrame, `${this.turnNumber}`);

//         upkeepFrame = null;
//         foodFrame = null;
//     }

//     /**
//      * stop
//      */
//     public static stop() {
//         this.turnTimer.pause();
//         this.turnTimer.destroy();
//         this.turnTimer = new Timer();
//         this.turnNumber = 1;
//     }
// }