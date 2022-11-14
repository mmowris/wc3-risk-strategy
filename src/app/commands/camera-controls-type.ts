import { File } from "w3ts";

interface CamData {
	distance: number;
	angle: number;
	rotation: number;
}

export enum CamSettings {
	MIN_DISTANCE = 1000.00,
	MAX_DISTANCE = 8500.00,
	DEFAULT_DISTANCE = 4000.00,

	MIN_ANGLE = 270.00,
	MAX_ANGLE = 350.00,
	DEFAULT_ANGLE = 290.00,

	MIN_ROTATION = 0.00,
	MAX_ROTATION = 360.00,
	DEFAULT_ROTATION = 90.00,
}

export const PlayerCamData: Map<player, CamData> = new Map<player, CamData>();
//THIS MUST RUN AFTER GAMEPLAYER CREATION
export default class CameraControls {
	private static instance: CameraControls;

	private constructor() {
		for (let i = 0; i < bj_MAX_PLAYERS; i++) {
			let data: CamData;
			let sDist: number;
			let sAngle: number;
			let sRot: number;

			if (GetPlayerSlotState(Player(i)) == PLAYER_SLOT_STATE_PLAYING && GetPlayerController(Player(i)) == MAP_CONTROL_USER) {
				let contents: string;

				if (Player(i) == GetLocalPlayer()) {
					contents = File.read("camSettings.pld");
				}

				if (contents) {
					sDist = S2R(contents.split(' ')[0]);
					sAngle = S2R(contents.split(' ')[1]);
					sRot = S2R(contents.split(' ')[2]);
				}
			}

			data = {
				distance: !sDist ? CamSettings.DEFAULT_DISTANCE : sDist,
				angle: !sAngle ? CamSettings.DEFAULT_ANGLE : sAngle,
				rotation: !sRot ? CamSettings.DEFAULT_ROTATION : sRot
			}

			PlayerCamData.set(Player(i), data);
			data = null
		}

		this.camReset();
	}

	public static getInstance() {
		if (this.instance == null) {
			this.instance = new CameraControls();
		}
		return this.instance;
	}

	public checkCamData(data: CamData, vals: string[]) {
		if (vals[0]) this.checkDistance(data, S2R(vals[0]));
		if (vals[1]) this.checkAngle(data, S2R(vals[1]));
		if (vals[2]) this.checkRotation(data, S2R(vals[2]));
	}

	private camReset() {
		const resetTimer: timer = CreateTimer();

		TimerStart(resetTimer, 0.5, true, () => {
			for (let i = 0; i < bj_MAX_PLAYER_SLOTS; i++) {
				this.setCameraFields(Player(i), PlayerCamData.get(Player(i)))
			}
		});
	}

	private checkDistance(data: CamData, val: number) {
		if (val > CamSettings.MAX_DISTANCE) val = CamSettings.MAX_DISTANCE;
		if (val < CamSettings.MIN_DISTANCE) val = CamSettings.MIN_DISTANCE;

		return data.distance = val;
	}

	private checkAngle(data: CamData, val: number) {
		if (val > CamSettings.MAX_ANGLE) val = CamSettings.MAX_ANGLE;
		if (val < CamSettings.MIN_ANGLE) val = CamSettings.MIN_ANGLE;

		return data.angle = val;
	}

	private checkRotation(data: CamData, val: number) {
		if (val > CamSettings.MAX_ROTATION) val = CamSettings.MAX_ROTATION;
		if (val < CamSettings.MIN_ROTATION) val = CamSettings.MIN_ROTATION;

		return data.rotation = val;
	}

	private setCameraFields(p: player, data: CamData) {
		SetCameraFieldForPlayer(p, CAMERA_FIELD_TARGET_DISTANCE, data.distance, 0.00)
		SetCameraFieldForPlayer(p, CAMERA_FIELD_ANGLE_OF_ATTACK, data.angle, 0.00)
		SetCameraFieldForPlayer(p, CAMERA_FIELD_ROTATION, data.rotation, 0.00)
		SetCameraFieldForPlayer(p, CAMERA_FIELD_FARZ, 10000, 0.00)
	}
}