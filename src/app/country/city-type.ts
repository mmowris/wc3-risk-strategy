import { Transports } from "app/transports-type";
import { UID } from "resources/unitID";
import { UTYPE } from "resources/unitTypes";
import { FilterFriendlyValidGuards, isGuardValid } from "./guard-filters";
import { compareValue } from "./guard-options";

export const Cities: City[] = [];
export const CityRegionSize: number = 185;

export const enterCityTrig: trigger = CreateTrigger();
export const leaveCityTrig: trigger = CreateTrigger();
export const unitTrainedTrig: trigger = CreateTrigger();

const defaultOwner: player = Player(24);

export class City {
	private _barrack: unit;
	private cop: unit;
	private _guard: unit;
	private region: region;
	private x: number;
	private y: number;
	private defaultGuardType: number;
	private defaultBarrackType: number;

	public static fromBarrack = new Map<unit, City>();
	public static fromGuard = new Map<unit, City>();
	public static fromRegion = new Map<region, City>();
	public static cities: City[] = [];

	constructor(x: number, y: number, barrackType: number, name?: string, guardType: number = UID.RIFLEMEN) {
		this.defaultBarrackType = barrackType;
		this.setBarrack(x, y, name);

		//Create region
		const offSetX: number = x - 125;
		const offSetY: number = y - 255;

		let rect = Rect(offSetX - CityRegionSize / 2, offSetY - CityRegionSize / 2, offSetX + CityRegionSize / 2, offSetY + CityRegionSize / 2);
		this.x = GetRectCenterX(rect);
		this.y = GetRectCenterY(rect);

		this.region = CreateRegion();
		RegionAddRect(this.region, rect);
		RemoveRect(rect);
		City.fromRegion.set(this.region, this);

		TriggerRegisterEnterRegion(enterCityTrig, this.region, null);
		TriggerRegisterLeaveRegion(leaveCityTrig, this.region, null);

		if (this.isPort()) TriggerRegisterUnitEvent(unitTrainedTrig, this.barrack, EVENT_UNIT_TRAIN_FINISH);

		//Create cop
		this.cop = CreateUnit(defaultOwner, UID.CONTROL_POINT, offSetX, offSetY, 270);

		this.defaultGuardType = guardType;
		this.setGuard(guardType);

		rect = null;
	}

	//Static API
	public static init() {
		//Germany
		Cities[0] = new City(320.0, 320.0, UID.CITY)
		Cities[1] = new City(-832.0, 64.0, UID.CITY)
		Cities[2] = new City(320.0, -1024.0, UID.CITY)
		Cities[3] = new City(-1472.0, -1024.0, UID.CITY)
		Cities[4] = new City(-1408.0, -2432.0, UID.CITY)
		Cities[5] = new City(-384.0, -2944.0, UID.CITY)
		//Poland
		Cities[6] = new City(3584.0, 128.0, UID.CITY)
		Cities[7] = new City(1664.0, -384.0, UID.CITY)
		Cities[8] = new City(2048.0, 832.0, UID.CITY)
		Cities[9] = new City(4032.0, -1152.0, UID.CITY)
		//Czech Republic
		Cities[10] = new City(768.0, -2048.0, UID.CITY)
		Cities[11] = new City(2112.0, -1664.0, UID.CITY)
		//Austria
		Cities[12] = new City(1408.0, -3008.0, UID.CITY)
		Cities[13] = new City(448.0, -3648.0, UID.CITY)
		//Slovenia
		Cities[14] = new City(1856.0, -4032.0, UID.CITY)
		Cities[15] = new City(896.0, -4736.0, UID.CITY)
		//Croatia
		Cities[16] = new City(2880.0, -4864.0, UID.CITY)
		Cities[17] = new City(1920.0, -5760.0, UID.CITY)
		//Bosnia-Herzegovina
		Cities[18] = new City(3456.0, -5632.0, UID.CITY)
		Cities[19] = new City(2752.0, -6656.0, UID.CITY)
		//Montenegro
		Cities[20] = new City(3776.0, -6656.0, UID.CITY)
		Cities[21] = new City(4736.0, -6720.0, UID.CITY)
		//Serbia
		Cities[22] = new City(4416.0, -4992.0, UID.CITY)
		Cities[23] = new City(5248.0, -5568.0, UID.CITY)
		//North Macedonia
		Cities[24] = new City(5952.0, -6848.0, UID.CITY)
		Cities[25] = new City(5440.0, -7872.0, UID.CITY)
		//Albania
		Cities[26] = new City(4736.0, -8768.0, UID.CITY)
		Cities[27] = new City(3680.0, -7904.0, UID.PORT)
		//Greece
		Cities[28] = new City(7168.0, -7616.0, UID.CITY)
		Cities[29] = new City(6112.0, -11232.0, UID.PORT)
		Cities[30] = new City(6464.0, -9472.0, UID.CITY)
		Cities[31] = new City(5504.0, -9536.0, UID.CITY)
		//Bulgaria
		Cities[32] = new City(6784.0, -6016.0, UID.CITY)
		Cities[33] = new City(7808.0, -5952.0, UID.CITY)
		//Romania
		Cities[34] = new City(5184.0, -3968.0, UID.CITY)
		Cities[35] = new City(6144.0, -4864.0, UID.CITY)
		Cities[36] = new City(7616.0, -4672.0, UID.CITY)
		Cities[37] = new City(6528.0, -3456.0, UID.CITY)
		//Moldova
		Cities[38] = new City(7296.0, -2496.0, UID.CITY)
		Cities[39] = new City(8384.0, -3136.0, UID.CITY)
		//Ukraine
		Cities[40] = new City(6080.0, -2048.0, UID.CITY)
		Cities[41] = new City(5696.0, -1024.0, UID.CITY)
		Cities[42] = new City(7232.0, -832.0, UID.CITY)
		Cities[43] = new City(9344.0, -1984.0, UID.CITY)
		Cities[44] = new City(10240.0, -384.0, UID.CITY)
		Cities[45] = new City(11328.0, -1664.0, UID.CITY)
		//Turkey
		Cities[46] = new City(10048.0, -9280.0, UID.CITY)
		Cities[47] = new City(11072.0, -7168.0, UID.CITY)
		Cities[48] = new City(12288.0, -8192.0, UID.CITY)
		Cities[49] = new City(16704.0, -6080.0, UID.CITY)
		Cities[50] = new City(15424.0, -7360.0, UID.CITY)
		Cities[51] = new City(11360.0, -10336.0, UID.PORT)
		Cities[52] = new City(8800.0, -7392.0, UID.PORT)
		//Georgia
		Cities[53] = new City(16064.0, -4096.0, UID.CITY)
		Cities[54] = new City(14976.0, -3648.0, UID.CITY)
		//Syria
		Cities[55] = new City(17472.0, -9664.0, UID.CITY)
		Cities[56] = new City(16064.0, -9408.0, UID.CITY)
		Cities[57] = new City(16512.0, -10880.0, UID.CITY)
		//Lebanon
		Cities[58] = new City(14784.0, -9600.0, UID.CITY)
		Cities[59] = new City(14976.0, -11136.0, UID.CITY)
		//Palestine
		Cities[60] = new City(15808.0, -12224.0, UID.CITY)
		//Isreal
		Cities[61] = new City(14976.0, -13440.0, UID.CITY)
		Cities[62] = new City(13900.0, -12320.0, UID.PORT)
		//Jordan
		Cities[63] = new City(17344.0, -12480.0, UID.CITY)
		Cities[64] = new City(17728.0, -13440.0, UID.CITY)
		Cities[65] = new City(16128.0, -14272.0, UID.CITY)
		//Egypt
		Cities[66] = new City(14400.0, -14784.0, UID.CITY)
		Cities[67] = new City(12480.0, -14080.0, UID.CITY)
		Cities[68] = new City(12928.0, -15104.0, UID.CITY)
		Cities[69] = new City(9408.0, -15104.0, UID.CITY)
		//Lybia
		Cities[70] = new City(7680.0, -14528.0, UID.CITY)
		Cities[71] = new City(6208.0, -15040.0, UID.CITY)
		Cities[72] = new City(5088.0, -14112.0, UID.PORT)
		//Tunisia
		Cities[73] = new City(-1408.0, -13824.0, UID.CITY)
		Cities[74] = new City(-160.0, -14496.0, UID.PORT)
		//Algeria
		Cities[75] = new City(-3648.0, -14144.0, UID.CITY)
		Cities[76] = new City(-5760.0, -15040.0, UID.CITY)
		Cities[77] = new City(-7360.0, -14336.0, UID.CITY)
		//Morocco
		Cities[78] = new City(-8832.0, -15104.0, UID.CITY)
		Cities[79] = new City(-10688.0, -14080.0, UID.CITY)
		Cities[80] = new City(-12320.0, -14368.0, UID.PORT)
		//Portugal
		Cities[81] = new City(-11328.0, -9600.0, UID.CITY)
		Cities[82] = new City(-10624.0, -7296.0, UID.CITY)
		Cities[83] = new City(-12000.0, -7968.0, UID.PORT)
		//Spain
		Cities[84] = new City(-9728.0, -10240.0, UID.CITY)
		Cities[85] = new City(-9408.0, -8192.0, UID.CITY)
		Cities[86] = new City(-6976.0, -8384.0, UID.CITY)
		Cities[87] = new City(-7616.0, -6976.0, UID.CITY)
		Cities[88] = new City(-10112.0, -5952.0, UID.CITY)
		Cities[89] = new City(-6688.0, -10272.0, UID.PORT)
		//France
		Cities[90] = new City(-5504.0, -6272.0, UID.CITY)
		Cities[91] = new City(-5440.0, -5120.0, UID.CITY)
		Cities[92] = new City(-3584.0, -5568.0, UID.CITY)
		Cities[93] = new City(-3520.0, -3776.0, UID.CITY)
		Cities[94] = new City(-4800.0, -3136.0, UID.CITY)
		Cities[95] = new City(-6336.0, -3456.0, UID.CITY)
		Cities[96] = new City(-6944.0, -4704.0, UID.PORT)
		Cities[97] = new City(-4384.0, -7008.0, UID.PORT)
		//Switzerland
		Cities[98] = new City(-2432.0, -4160.0, UID.CITY)
		Cities[99] = new City(-1280.0, -4352.0, UID.CITY)
		//Italy
		Cities[100] = new City(-1856.0, -5440.0, UID.CITY)
		Cities[101] = new City(-448.0, -6272.0, UID.CITY)
		Cities[102] = new City(448.0, -7296.0, UID.CITY)
		Cities[103] = new City(1408.0, -8256.0, UID.CITY)
		//Belgium
		Cities[104] = new City(-3072.0, -2368.0, UID.CITY)
		Cities[105] = new City(-4384.0, -608.0, UID.PORT)
		//Netherlands
		Cities[106] = new City(-3200.0, -1024.0, UID.CITY)
		Cities[107] = new City(-2368.0, -128.0, UID.CITY)
		Cities[108] = new City(-3168.0, 480.0, UID.PORT)
		//Denmark
		Cities[109] = new City(-960.0, 1408.0, UID.CITY)
		Cities[110] = new City(-1088.0, 2560.0, UID.CITY)
		Cities[111] = new City(-2272.0, 2464.0, UID.PORT)
		//Norway
		Cities[112] = new City(-1856.0, 5056.0, UID.CITY)
		Cities[113] = new City(-768.0, 5312.0, UID.CITY)
		Cities[114] = new City(-640.0, 7232.0, UID.CITY)
		Cities[115] = new City(576.0, 10112.0, UID.CITY)
		Cities[116] = new City(1728.0, 12224.0, UID.CITY)
		Cities[117] = new City(-2464.0, 3680.0, UID.PORT)
		Cities[118] = new City(-1760.0, 7904.0, UID.PORT)
		//Sweden
		Cities[119] = new City(1856.0, 10240.0, UID.CITY)
		Cities[120] = new City(1216.0, 8704.0, UID.CITY)
		Cities[121] = new City(576.0, 6400.0, UID.CITY)
		Cities[122] = new City(512.0, 3392.0, UID.CITY)
		Cities[123] = new City(1760.0, 3040.0, UID.PORT)
		//Finland
		Cities[124] = new City(3968.0, 11584.0, UID.CITY)
		Cities[125] = new City(4800.0, 10368.0, UID.CITY)
		Cities[126] = new City(4480.0, 8448.0, UID.CITY)
		Cities[127] = new City(4096.0, 6848.0, UID.CITY)
		Cities[128] = new City(3424.0, 9184.0, UID.PORT)
		//England
		Cities[129] = new City(-6528.0, 256.0, UID.CITY)
		Cities[130] = new City(-6784.0, 1600.0, UID.CITY)
		Cities[131] = new City(-7040.0, 3200.0, UID.CITY)
		Cities[132] = new City(-8352.0, -672.0, UID.PORT)
		//Ireland
		Cities[133] = new City(-11136.0, 2368.0, UID.CITY)
		Cities[134] = new City(-10208.0, 4000.0, UID.PORT)
		Cities[135] = new City(-11488.0, 800.0, UID.PORT)
		//Iceland
		Cities[136] = new City(-6592.0, 9344.0, UID.CITY)
		Cities[137] = new City(-7936.0, 9792.0, UID.CITY)
		Cities[138] = new City(-7200.0, 7968.0, UID.PORT)
		Cities[139] = new City(-5920.0, 10464.0, UID.PORT)
		//Svalbard
		Cities[140] = new City(-576.0, 14912.0, UID.CITY)
		Cities[141] = new City(-1760.0, 14496.0, UID.PORT)
		//Estonia
		Cities[142] = new City(5056.0, 5312.0, UID.CITY)
		Cities[143] = new City(4128.0, 4640.0, UID.PORT)
		//Latvia
		Cities[144] = new City(5440.0, 3520.0, UID.CITY)
		Cities[145] = new City(3104.0, 3616.0, UID.PORT)
		//Lithuania
		Cities[146] = new City(5312.0, 2048.0, UID.CITY)
		Cities[147] = new City(4160.0, 2496.0, UID.CITY)
		//Kaliningrad
		Cities[148] = new City(4096.0, 1344.0, UID.CITY)
		Cities[149] = new City(2976.0, 1952.0, UID.PORT)
		//Belarus
		Cities[150] = new City(6912.0, 2560.0, UID.CITY)
		Cities[151] = new City(6912.0, 1472.0, UID.CITY)
		Cities[152] = new City(7680.0, 512.0, UID.CITY)
		Cities[153] = new City(5376.0, 384.0, UID.CITY)
		//Malta
		Cities[154] = new City(896.0, -13120.0, UID.CITY)
		Cities[155] = new City(2400.0, -12896.0, UID.PORT)
		//North District|n(Russia)
		Cities[156] = new City(6272.0, 12224.0, UID.CITY)
		Cities[157] = new City(10624.0, 11776.0, UID.CITY)
		Cities[158] = new City(10688.0, 9984.0, UID.CITY)
		Cities[159] = new City(12288.0, 8448.0, UID.CITY)
		Cities[160] = new City(9280.0, 6208.0, UID.CITY)
		Cities[161] = new City(6048.0, 6112.0, UID.PORT)
		Cities[162] = new City(6880.0, 10464.0, UID.PORT)
		//Slovakia
		Cities[163] = new City(3968.0, -2304.0, UID.CITY)
		Cities[164] = new City(2752.0, -2624.0, UID.CITY)
		//Hungary
		Cities[165] = new City(4416.0, -3200.0, UID.CITY)
		Cities[166] = new City(3136.0, -3776.0, UID.CITY)
		//Sicily
		Cities[167] = new City(320.0, -10368.0, UID.CITY)
		Cities[168] = new City(1238.0, -11566.0, UID.PORT)
		//Disko Bay
		Cities[169] = new City(-11584.0, 14400.0, UID.CITY)
		Cities[170] = new City(-10432.0, 15104.0, UID.CITY)
		Cities[171] = new City(-11040.0, 12960.0, UID.PORT)
		//East Greenland
		Cities[172] = new City(-6016.0, 15424.0, UID.CITY)
		Cities[173] = new City(-5600.0, 14048.0, UID.PORT)
		//Sami
		Cities[174] = new City(3264.0, 13504.0, UID.CITY)
		Cities[175] = new City(4160.0, 13056.0, UID.CITY)
		//Scotland
		Cities[176] = new City(-8000.0, 4672.0, UID.CITY)
		Cities[177] = new City(-7552.0, 5952.0, UID.CITY)
		Cities[178] = new City(-6432.0, 4960.0, UID.PORT)
		//Novaya Zemlya
		Cities[179] = new City(10496.0, 16064.0, UID.CITY)
		Cities[180] = new City(11936.0, 15584.0, UID.PORT)
		//Crimea
		Cities[181] = new City(11456.0, -3264.0, UID.CITY)
		Cities[182] = new City(10464.0, -4128.0, UID.PORT)
		//Azerbaijan
		Cities[183] = new City(18432.0, -3584.0, UID.CITY)
		Cities[184] = new City(17472.0, -4352.0, UID.CITY)
		//Armenia
		Cities[185] = new City(18432.0, -5888.0, UID.CITY)
		//Southern District|n(Russia)
		Cities[186] = new City(14400.0, -1856.0, UID.CITY)
		Cities[187] = new City(14848.0, 1216.0, UID.CITY)
		Cities[188] = new City(16704.0, 1088.0, UID.CITY)
		Cities[189] = new City(17088.0, -1152.0, UID.CITY)
		Cities[190] = new City(13024.0, -3808.0, UID.PORT)
		//Volga District|n(Russia)
		Cities[191] = new City(15424.0, 5376.0, UID.CITY)
		Cities[192] = new City(18048.0, 6720.0, UID.CITY)
		Cities[193] = new City(17984.0, 3840.0, UID.CITY)
		//Central District|n(Russia)
		Cities[194] = new City(8640.0, 3264.0, UID.CITY)
		Cities[195] = new City(10496.0, 1536.0, UID.CITY)
		Cities[196] = new City(13056.0, 2496.0, UID.CITY)
		Cities[197] = new City(11264.0, 3968.0, UID.CITY)
		Cities[198] = new City(12864.0, 5632.0, UID.CITY)
		//Siberia
		Cities[199] = new City(16576.0, 15744.0, UID.CITY)
		Cities[200] = new City(18176.0, 15616.0, UID.CITY)
		//Moscow
		Cities[201] = new City(15296.0, 8960.0, UID.CITY)
		Cities[202] = new City(13952.0, 8384.0, UID.CITY)
		//National Park
		Cities[203] = new City(-8768.0, 15232.0, UID.CITY)
		Cities[204] = new City(-7936.0, 14336.0, UID.CITY)
		Cities[205] = new City(-9472.0, 13696.0, UID.CITY)
		//West Greeland
		Cities[206] = new City(-12736.0, 14976.0, UID.CITY)
		Cities[207] = new City(-12352.0, 13120.0, UID.CITY)
		//Wales
		Cities[208] = new City(-8000.0, 2304.0, UID.CITY)
		Cities[209] = new City(-8512.0, 1216.0, UID.CITY)
		//Sardinia
		Cities[210] = new City(-2400.0, -7400.0, UID.PORT)
		Cities[211] = new City(-1376.0, -8928.0, UID.PORT)
		//Crete
		Cities[212] = new City(8864.0, -11680.0, UID.PORT)
		Cities[213] = new City(7008.0, -12192.0, UID.PORT)
		//Cyprus
		Cities[214] = new City(13408.0, -10272.0, UID.PORT)
		Cities[215] = new City(12576.0, -11808.0, UID.PORT)

		this.onEnter();
		this.onLeave();
		this.onTrain();
	}

	public static onCast() {
		let trigUnit: unit = GetTriggerUnit();
		let targUnit: unit = GetSpellTargetUnit()
		const city: City = City.fromBarrack.get(trigUnit);

		if (!city.isPort() && IsUnitType(targUnit, UTYPE.SHIP)) return false;

		if ((IsUnitType(city.guard, UTYPE.SHIP) && IsTerrainPathable(GetUnitX(targUnit), GetUnitY(targUnit), PATHING_TYPE_FLOATABILITY)) ||
			(!IsUnitType(city.guard, UTYPE.SHIP) && IsTerrainPathable(GetUnitX(targUnit), GetUnitY(targUnit), PATHING_TYPE_WALKABILITY))) {
			city.changeGuard(targUnit);
		} else {
			let oldGuard: unit = city.guard;
			let x: number = GetUnitX(targUnit);
			let y: number = GetUnitY(targUnit);

			city.changeGuard(targUnit);
			SetUnitPosition(oldGuard, x, y);
			SetUnitPosition(city.guard, city.x, city.y);

			oldGuard = null;
		}

		city.setOwner(GetOwningPlayer(targUnit));
		trigUnit = null;
		targUnit = null;

		return false;
	}

	//Public API
	public get barrack(): unit {
		return this._barrack;
	}

	public get guard(): unit {
		return this._guard;
	}

	public isPort(): boolean {
		return GetUnitTypeId(this.barrack) == UID.PORT;
	}

	public isGuardShip(): boolean {
		return IsUnitType(this.guard, UTYPE.SHIP);
	}

	public isGuardDummy(): boolean {
		return GetUnitTypeId(this.guard) == UID.DUMMY_GUARD;
	}

	public getOwner(): player {
		return GetOwningPlayer(this.barrack);
	}

	public reset() {
		const x: number = GetUnitX(this.barrack);
		const y: number = GetUnitY(this.barrack);
		const name: string = GetUnitName(this.barrack);

		City.fromBarrack.delete(this.barrack);
		RemoveUnit(this.barrack)
		this._barrack = null;
		this.setBarrack(x, y, name);
		this.removeGuard(true);
		this.setGuard(this.defaultGuardType);
	}

	public changeGuardOwner() {
		SetUnitOwner(this._guard, this.getOwner(), true);
	}

	//removed full change boolean - never changes guard
	//removed reset rally boolean - always resets now
	//removed change color boolean - always change color
	//Previously updateOwner & changeOwner 
	public setOwner(newOwner: player) {
		if (this.getOwner() == newOwner) return false;

		SetUnitOwner(this.barrack, newOwner, true);
		SetUnitOwner(this.cop, newOwner, true);
		//SetUnitOwner(this.guard, newOwner, true);

		IssuePointOrder(this.barrack, "setrally", GetUnitX(this.barrack) - 70, GetUnitY(this.barrack) - 155)
	}

	//Internal Functions
	private setBarrack(x: number, y: number, name?: string) {
		this._barrack = CreateUnit(defaultOwner, this.defaultBarrackType, x, y, 270);
		City.fromBarrack.set(this.barrack, this);

		if (name && name != GetUnitName(this.barrack)) BlzSetUnitName(this.barrack, name);
	}

	/**
	 * Previously setGuard & createGuard
	 */
	private setGuard(guard: unit | number) {
		//TODO add null checking - 4/23/2022 idk what needs null checked maybe check if guard is null
		typeof guard === "number" ? this._guard = CreateUnit(defaultOwner, guard, this.x, this.y, 270) : this._guard = guard;
		UnitAddType(this.guard, UTYPE.GUARD);
		City.fromGuard.set(this.guard, this);
	}

	/**
	 * Previously removeGuard & deleteGuard 
	 */
	private removeGuard(destroy: boolean = false) {
		City.fromGuard.delete(this.guard);

		if (!destroy) {
			UnitRemoveType(this.guard, UTYPE.GUARD);
		} else {
			RemoveUnit(this.guard);
		}

		this._guard = null;
	}

	private changeGuard(newGuard: unit) {
		if (this.guard != newGuard) {
			this.removeGuard(this.isGuardDummy());
			this.setGuard(newGuard);
		}

		SetUnitPosition(this.guard, this.x, this.y);
	}

	private dummyGuard(owner: player) {
		this.changeGuard(CreateUnit(owner, UID.DUMMY_GUARD, this.x, this.y, 270));
		this.setOwner(owner);
	}

	private static onEnter() {
		TriggerAddCondition(enterCityTrig, Condition(() => {
			if (IsUnitType(GetTriggerUnit(), UTYPE.TRANSPORT)) return false;

			const city: City = City.fromRegion.get(GetTriggeringRegion());

			if (isGuardValid(city)) return false;

			city.changeGuard(GetTriggerUnit());
			city.setOwner(GetOwningPlayer(GetTriggerUnit()));

			return false;
		}));
	}

	private static onLeave() {
		TriggerAddCondition(leaveCityTrig, Condition(() => {
			if (!IsUnitType(GetTriggerUnit(), UTYPE.GUARD)) return false;

			const city: City = City.fromRegion.get(GetTriggeringRegion());
			let g: group = CreateGroup();
			let guardChoice: unit = city.guard;

			GroupEnumUnitsInRange(g, city.x, city.y, CityRegionSize, FilterFriendlyValidGuards(city));

			if (BlzGroupGetSize(g) == 0 && !isGuardValid(city)) {
				city.dummyGuard(GetOwningPlayer(city.barrack));
				return false;
			};

			ForGroup(g, () => {
				guardChoice = compareValue(GetEnumUnit(), guardChoice);
			});

			city.changeGuard(guardChoice);

			DestroyGroup(g);
			g = null;
			guardChoice = null;

			return false;
		}));
	}

	private static onTrain() {
		TriggerAddCondition(unitTrainedTrig, Condition(() => {
			const city: City = City.fromBarrack.get(GetTriggerUnit());
			let trainedUnit: unit = GetTrainedUnit();

			if (IsUnitType(trainedUnit, UTYPE.TRANSPORT)) {
				Transports.onCreate(trainedUnit);
			}

			if (city.isGuardShip() && !IsUnitType(trainedUnit, UTYPE.SHIP)) {
				city.changeGuard(trainedUnit);
			}

			trainedUnit = null;

			return false;
		}))
	}
}