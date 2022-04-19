import { GamePlayer } from "app/player/player-type";
import { Scoreboard } from "app/scoreboard/scoreboard-type";
import { HexColors } from "resources/hexColors";
import { TextTag, MapPlayer, Trigger } from "w3ts";
import { Players } from "w3ts/globals";

export function ErrorMessage(p: player, msg: string) {
    if (GetLocalPlayer() == p) ClearTextMessages();

    DisplayTimedTextToPlayer(p, 0.52, 0.96, 2.00, `\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n${HexColors.TANGERINE} ${msg}|r`);

    PlayLocalSound("Sound\\Interface\\Error.flac", p);
}

export function PlayLocalSound(soundPath: string, p: player) {
    let sound = CreateSound(soundPath, false, false, true, 10, 10, "")

    if (GetLocalPlayer() != p) SetSoundVolume(sound, 0);

    StartSound(sound);
    KillSoundWhenDone(sound);
    sound = null;
}

export function showOverheadText(x: number, y: number, r: number, g: number, b: number, a: number, text: string) {
    const t = new TextTag();
    t.setText(text, 10, true);
    t.setPos(x, y, 90);
    t.setColor(r, g, b, a);
    t.setPermanent(false);
    t.setLifespan(2);
    t.setFadepoint(1);
    t.setVisible(true);
    t.setVelocity(0, 7.1 / 128 * Sin(3.14159 / 2));;
    return t;
}

export function MessageAllPlayers(message: string, time: number): void {    
    DisplayTimedTextToForce(bj_FORCE_ALL_PLAYERS, time, message);
}

export function MessagePlayer(who: number, message: string);
export function MessagePlayer(who: MapPlayer, message: string);
export function MessagePlayer(who: MapPlayer | number, message: string): void {
    if (who instanceof MapPlayer) {
        DisplayTimedTextToPlayer(who.handle, 0, 0, 10, message);
    }
    else {
        DisplayTimedTextToPlayer(Player(who), 0, 0, 10, message);
    }
}

export function GetActivePlayers() {
    return Players.filter(currentPlayer => {
            const isPlaying = currentPlayer.slotState == PLAYER_SLOT_STATE_PLAYING;
            const isUser = currentPlayer.getState(PLAYER_STATE_OBSERVER) == 0;
        
            if (isPlaying && isUser) {
                return true;
            }
    });
}

/**
 * Should always be defined,
 * Used for measuring Z heights
 */
 let TEMP_LOCATION = Location(0, 0);

 export function getZFromXY(x: number, y: number): number {
    MoveLocation(TEMP_LOCATION, x, y);
    const z = GetLocationZ(TEMP_LOCATION);
    return z;
 
    // const cliffLevel = GetTerrainCliffLevel(x, y);
 
    // Log.Information("C: "+cliffLevel+"Z: "+z);
    // return (cliffLevel - 2) * 256;
 }
 
export function syncData(handle: string, listenFor: MapPlayer, cb: (result: string) => void): (data: string) => void {
    // Create and register listen
    const syncTrigger = new Trigger();
    syncTrigger.registerPlayerSyncEvent(listenFor, handle, false);
    syncTrigger.addAction(() => {
        const data = BlzGetTriggerSyncData();
        // Erase this trigger
        syncTrigger.destroy();
        // Return result
        cb(data);
    });

    return (toSend: string) => {
        BlzSendSyncData(handle, toSend);
    }
}

export function distanceBetweenPoints(x1: number, y1: number, x2: number, y2: number) {
    return SquareRoot(Pow(x2 - x1, 2) + Pow(y2 - y1, 2));
}

// declare const udg_collision_rect: rect;
// declare const udg_collision_item: item;

// let collisionRect: Rectangle;
// let collisionItem: Item;

// export function terrainIsPathable(x: number, y: number) {
//     if (!collisionRect) collisionRect = Rectangle.fromHandle(udg_collision_rect);
//     if (!collisionItem) collisionItem = Item.fromHandle(udg_collision_item);
//     if (IsTerrainPathable(x, y, PATHING_TYPE_WALKABILITY)) return false;

//     collisionItem.visible = true;
//     // move rect
//     collisionRect.move(x, y);
//     // Move item
//     collisionItem.x = x;
//     collisionItem.y = y;

//     const hasItem = RectContainsItem(collisionItem.handle, collisionRect.handle)

//     collisionItem.visible = false;

//     return hasItem;
// }

// let camIterator = 0;
// export function GetPlayerCamLoc(who: MapPlayer, callback: (x: number, y: number) => void) {
//     const syncher = syncData(`${camIterator++}`, who, (data: string) => {
//         // Log.Information(data);
//         const x = S2R(data.split(',')[0]);
//         const y = S2R(data.split(',')[1]);
    
//         callback(x,y);
//     });

//     if (GetLocalPlayer() == who.handle) {
//         const x = GetCameraTargetPositionX();
//         const y = GetCameraTargetPositionY();
//         syncher(`${x},${y}`);
//     }
// }

// const selectionGroup = CreateGroup();
// export function GetPlayerUnitSelection(who: MapPlayer, callback: (Unit: Unit[]) => void) {

//     GroupEnumUnitsSelected(selectionGroup, who.handle, null); 
//     let sendString = '';         
//     ForGroup(selectionGroup, () => {
//         sendString += GetUnitUserData(GetEnumUnit())+";";
//     });   
//     GroupClear(selectionGroup);
    
//     const syncher = syncData(`${camIterator++}`, who, (data: string) => {
//         const uIndexes = data.split(";");
//         const result: Unit[] = [];
//         uIndexes.forEach(uIdx => {
//             result.push(UnitDex.unit[Number(uIdx)]);
//         });
//         callback(result);
//     });

//     syncher(sendString);
// }