// export const enum Status {
//     PLAYING = "|cFF00FFF0Playing|r",
//     OBSERVING = "|cFFFFFFFFObserving|r",
//     ALIVE = "|cFF00FF00Alive|r",
//     NOMAD = "|cFFFE8A0ENmd|r",
//     DEAD = "|cFFFF0005Dead|r",
//     FORFEIT = "|cFFFFFC01Forfeit|r",
//     LEFT = "|cFF65656ALeft|r",
//     STFU = "|cfffe890dSTFU |r",
// };

export class PlayerStatus {

    onPlaying() {
        /**
         * update status
         * update income to 4
         * change name
         */
    }

    onObserving() {
        /**
         * update status
         * update income to 0
         * change name
         */
    }

    onAlive() {
        /**
         * update status
         * update income to 4
         */
    }

    onNomad() {
        /**
         * update status
         * update income to 3
         */
    }

    onForfeit() {
        /**
         * update status
         * send forfeit message to all players
         * check victory conditions
         * update income to 2
         * remove players gold
         * change name
         * remove unit selection
         */
    }

    onDead() {
        /**
         * update status
         * send dead message to all players
         * check victory conditions
         * update income to 1
         * remove players gold
         * change name
         * remove unit selection
         */
    }

    onLeft() {
        /**
         * update status
         * send left message to all players
         * check victory conditions
         * update income to 0
         * remove players gold
         * change name
         * remove unit selection
         */
    }




}

/**
 * updateStatus calls in V2
 * Forfeit() - Forfeit - player forfeits via command/ability cast
 * NomadTimer() - Dead - player dies due to nomad time running out
 * PlayerLeaves() - Left - player left the game
 * UnitDies() - Dead - units == 0 && cities == 0
 * City.adjustTrackers() - Nomad,Dead,Alive
 *          Nomad - alive && cities == 0 && ownedUnits > 0
 *          Dead - alive && cities == 0 && ownedUnits == 0
 *          Alive - nomad && cities >= 1
 * GamePlayer.constructor - LEFT - honestly idk why i default to left, probably because I was making 23 gameplayers, this can be cleaned up and removed
 * Pregame.gamePlayerSetup() - Playing - init everyone to playing
 * Round.reset() - Playing - initial state of people in the game still
 * Round.playerSetup() - Alive - if playing, they are assumed to be players. this runs after mode selection
 * ModeSelection.obsButton() - Observing, playing - player choice
 */