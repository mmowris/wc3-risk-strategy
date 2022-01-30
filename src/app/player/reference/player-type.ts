
import { Players } from "w3ts/globals";
import { Names } from "./names-type";
import { Settings } from "./settings-type";

export enum PRIVS {
    USER, BOT, MODERATOR, DEVELOPER
}

export const BOTS = [
    `Grinch#1502`,
    `erikthegreat#1813`
];

export class PlayerData {
    public player: player;
    public name: Names = new Names();
    public settings: Settings;
    private force: ForceType;
    
    public originalName: string;
    public originalColour: playercolor;


    public cameraDistance = 0;
    public tipsOn = true;

    constructor(player: MapPlayer) {
        this.player = player;
        this.originalName = player.name;
        this.originalColour = player.color;
    }

    getUserPrivs(): PRIVS {
        const who = this.player;

        if (who.name === 'ForLolz#11696') return PRIVS.DEVELOPER;
        if (who.name === 'TacoMan#11175') return PRIVS.DEVELOPER;

        if (who.name === 'Local Player') return PRIVS.DEVELOPER;
        // No # means this is a local game
        if (who.name.indexOf("#") === -1) return PRIVS.DEVELOPER;

        else if (BOTS.indexOf(who.name.toLowerCase()) >= 0) {
            return PRIVS.BOT;
        }

        return PRIVS.USER;
    }

    setForce(force: ForceType) {
        this.force = force;
    }

    getForce() {
        return this.force;
    }

    // /**
    //  * Saves the player's data to a text file
    //  */
    // public save() {
    //     const saveLoad = SyncSaveLoad.getInstance();
    //     if (this.player.isLocal()) {
    //         saveLoad.writeFile(`Codename Askellon\\${this.originalName}\\save.txt`, 
    //             `Player:${this.originalName}\n`+
    //             `WeaponTypeState:${this.attackType}\n`+
    //             `GamesPlayed:${this.gamesPlayed}\n`+
    //             `GamesLeft:${this.gamesLeft}\n`+
    //             `PlayerDeaths:${this.playerDeaths}\n`+
    //             `PlayerTeamKills:${this.playerTeamkills}\n`+
    //             `PlayerEnemyKills:${this.playerEnemyKills}\n`+
    //             `PlayerGamesWon:${this.playerGamesWon}\n`+
    //             `PlayerGamesLost:${this.playerGamesLost}\n`,
    //             `TipsDisabled:${!this.tipsOn}`
    //         );
    //     }
    // }

    // public load(cb?: () => void) {
    //     const saveLoad = SyncSaveLoad.getInstance();
    //     saveLoad.read(`Codename Askellon\\${this.originalName}\\save.txt`, this.player.handle, promise => {
    //         try {
    //             const result = Quick.UnpackStringNewlines(promise.finalString);
    //             result.forEach(r => {
    //                 const split = r.split(":");
    //                 const identifier = split[0];
    //                 const value = split[1];

    //                 switch(identifier) {
    //                     case "WeaponTypeState":
    //                         const t = Number(value);
    //                         this.setAttackType(t);
    //                         break;
    //                     case "GamesPlayed":
    //                         this.gamesPlayed = Number(value);
    //                         break;
    //                     case "GamesLeft":
    //                         this.gamesLeft = Number(value);
    //                         break;
    //                     case "PlayerDeaths":
    //                         this.playerDeaths = Number(value);
    //                         break;
    //                     case "PlayerTeamKills":
    //                         this.playerTeamkills = Number(value);
    //                         break;
    //                     case "PlayerEnemyKills":
    //                         this.playerEnemyKills = Number(value);
    //                         break;
    //                     case "PlayerGamesWon":
    //                         this.playerGamesWon = Number(value);
    //                         break;
    //                     case "PlayerGamesLost":
    //                         this.playerGamesLost = Number(value);
    //                         break;
    //                     case "TipsDisabled":
    //                         this.tipsOn = false;
    //                         break;
    //                     case "Player":
    //                         if (this.originalName != value) {
    //                             Log.Warning(`${this.originalName} HAS AN ALTERED SAVE FILE`);
    //                         }
    //                 }
    //             });
    //         }
    //         catch(e) {
    //             Log.Warning("Error when loading player "+this.originalName);
    //             Log.Warning(e);
    //         }
    //         if (cb) cb();
    //     });
    // }

    // public log(toWho: MapPlayer = this.player) {
    //     MessagePlayer(toWho, `:: Ship Records [${playerColors[this.player.id].code}${this.originalName}|r] ::`);
    //     MessagePlayer(toWho, `${COL_GOOD}Games Played ::|r ${this.gamesPlayed}`);
    //     MessagePlayer(toWho, `${COL_GOOD}Games Won ::|r ${this.playerGamesWon}`);
    //     // MessagePlayer(toWho, `${COL_GOOD}Enemy Kills ::|r ${this.playerTeamkills}`);

    //     // MessagePlayer(toWho, `${COLOUR_CULT}Games Left ::|r ${this.gamesLeft}`);
    //     // MessagePlayer(toWho, `${COLOUR_CULT}Games Lost ::|r ${this.playerGamesLost}`);
    //     // MessagePlayer(toWho, `${COLOUR_CULT}Team Kills ::|r ${this.playerTeamkills}`);
    // }
}