import { HexColors } from "resources/hexColors";
import { TextTag, MapPlayer, Trigger } from "w3ts";
import { Players } from "w3ts/globals";

export function ErrorMessage(p: player, msg: string) {
	if (GetLocalPlayer() == p) ClearTextMessages();

	DisplayTimedTextToPlayer(p, 0.52, 0.96, 2.00, `\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n${HexColors.TANGERINE} ${msg}|r`);

	PlayLocalSound("Sound\\Interface\\Error.flac", p);
}

export function MessageAll(clear: boolean, msg: string, x?: number, y?: number) {
	if (clear) ClearTextMessages();
	if (!x) x = 0.92;
	if (!y) y = 0.81;

	Players.forEach(p => {
		DisplayTimedTextToPlayer(p.handle, x, y, 5.00, msg);
	});
}

export function PlayLocalSound(soundPath: string, p: player) {
	let sound = CreateSound(soundPath, false, false, true, 10, 10, "")

	if (GetLocalPlayer() != p) SetSoundVolume(sound, 0);

	StartSound(sound);
	KillSoundWhenDone(sound);
	sound = null;
}

export function PlayGlobalSound(soundPath: string) {
	let sound = CreateSound(soundPath, false, false, true, 10, 10, "")

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