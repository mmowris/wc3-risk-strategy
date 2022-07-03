import { GamePlayer } from "app/player/player-type";
import { PlayLocalSound } from "libs/utils";
import { HexColors } from "resources/hexColors";
import { NEUTRAL_HOSTILE } from "resources/constants";
import { Cities, City } from "./city-type";
import { Spawner } from "./spawner-type";

export class Country {
	public name: string;
	private _cities: City[] = [];
	private spawner: Spawner;
	private text: texttag;
	private _owner: player;
	public citiesOwned: Map<GamePlayer, number> = new Map<GamePlayer, number>();
	public allocLim: number;

	public static fromName = new Map<string, Country>();
	public static fromCity = new Map<City, Country>();

	constructor(name: string, x: number, y: number, ...cities: City[]) {
		this.name = name;

		cities.forEach(city => {
			this.cities.push(city);
			Country.fromCity.set(city, this);
		});

		this.spawner = new Spawner(this.name, x, y, this.cities.length);

		const offsetX: number = GetUnitX(this.spawner.unit) - 100;
		const offsetY: number = GetUnitY(this.spawner.unit) - 300;
		const lengthCheck: number = this.name.length * 5.5 < 200 ? this.name.length * 5.5 : 200;

		this.text = CreateTextTag();
		SetTextTagText(this.text, `${HexColors.TANGERINE} ${this.name}`, 0.028);
		SetTextTagPos(this.text, offsetX - lengthCheck, offsetY, 16.00);
		SetTextTagVisibility(this.text, true);
		SetTextTagPermanent(this.text, true);

		this.allocLim = Math.floor(cities.length / 2);

		this._owner = NEUTRAL_HOSTILE;
	}

	//Static API
	public static init() {
		Country.fromName.set("Germany", new Country("Germany", -960.0, -1088.0, Cities[0], Cities[1], Cities[2], Cities[3], Cities[4], Cities[5]));
		Country.fromName.set("Poland", new Country("Poland", 2752.0, -64.0, Cities[6], Cities[7], Cities[8], Cities[9]));
		Country.fromName.set("Czech Republic", new Country("Czech Republic", 1216.0, -1984.0, Cities[10], Cities[11]));
		Country.fromName.set("Austria", new Country("Austria", 832.0, -3392.0, Cities[12], Cities[13]));
		Country.fromName.set("Slovenia", new Country("Slovenia", 1216.0, -4544.0, Cities[14], Cities[15]));
		Country.fromName.set("Croatia", new Country("Croatia", 2112.0, -5056.0, Cities[16], Cities[17]));
		Country.fromName.set("Bosnia", new Country("Bosnia", 3008.0, -6080.0, Cities[18], Cities[19]));
		Country.fromName.set("Montenegro", new Country("Montenegro", 4032.0, -6976.0, Cities[20], Cities[21]));
		Country.fromName.set("Serbia", new Country("Serbia", 4416.0, -5696.0, Cities[22], Cities[23]));
		Country.fromName.set("Macedonia", new Country("Macedonia", 5056.0, -7488.0, Cities[24], Cities[25]));
		Country.fromName.set("Albania", new Country("Albania", 4160.0, -8128.0, Cities[26], Cities[27]));
		Country.fromName.set("Greece", new Country("Greece", 5696.0, -9024.0, Cities[28], Cities[29], Cities[30], Cities[31]));
		Country.fromName.set("Bulgaria", new Country("Bulgaria", 6976.0, -6464.0, Cities[32], Cities[33]));
		Country.fromName.set("Romania", new Country("Romania", 6080.0, -4288.0, Cities[34], Cities[35], Cities[36], Cities[37]));
		Country.fromName.set("Moldova", new Country("Moldova", 7744.0, -2880.0, Cities[38], Cities[39]));
		Country.fromName.set("Ukraine", new Country("Ukraine", 8256.0, -1216.0, Cities[40], Cities[41], Cities[42], Cities[43], Cities[44], Cities[45]));
		Country.fromName.set("Turkey", new Country("Turkey", 12864.0, -7232.0, Cities[46], Cities[47], Cities[48], Cities[49], Cities[50], Cities[51], Cities[52]));
		Country.fromName.set("Georgia", new Country("Georgia", 15424.0, -4032.0, Cities[53], Cities[54]));
		Country.fromName.set("Syria", new Country("Syria", 16704.0, -10048.0, Cities[55], Cities[56], Cities[57]));
		Country.fromName.set("Lebanon", new Country("Lebanon", 14784.0, -10304.0, Cities[58], Cities[59]));
		Country.fromName.set("Palestine", new Country("Palestine", 16192.0, -12480.0, Cities[60]));
		Country.fromName.set("Israel", new Country("Israel", 14656.0, -12736.0, Cities[61], Cities[62]));
		Country.fromName.set("Jordan", new Country("Jordan", 16960.0, -13504.0, Cities[63], Cities[64], Cities[65]));
		Country.fromName.set("Egypt", new Country("Egypt", 11072.0, -14912.0, Cities[66], Cities[67], Cities[68], Cities[69]));
		Country.fromName.set("Lybia", new Country("Lybia", 6976.0, -14912.0, Cities[70], Cities[71], Cities[72]));
		Country.fromName.set("Tunisia", new Country("Tunisia", -1728.0, -14400.0, Cities[73], Cities[74]));
		Country.fromName.set("Algeria", new Country("Algeria", -5312.0, -14272.0, Cities[75], Cities[76], Cities[77]));
		Country.fromName.set("Morocco", new Country("Morocco", -10176.0, -14400.0, Cities[78], Cities[79], Cities[80]));
		Country.fromName.set("Portugal", new Country("Portugal", -11200.0, -8128.0, Cities[81], Cities[82], Cities[83]));
		Country.fromName.set("Spain", new Country("Spain", -8896.0, -8384.0, Cities[84], Cities[85], Cities[86], Cities[87], Cities[88], Cities[89]));
		Country.fromName.set("France", new Country("France", -5056.0, -4288.0, Cities[90], Cities[91], Cities[92], Cities[93], Cities[94], Cities[95], Cities[96], Cities[97]));
		Country.fromName.set("Switzerland", new Country("Switzerland", -1856.0, -4288.0, Cities[98], Cities[99]));
		Country.fromName.set("Italy", new Country("Italy", -1088.0, -5568.0, Cities[100], Cities[101], Cities[102], Cities[103]));
		Country.fromName.set("Belgium", new Country("Belgium", -3648.0, -1856.0, Cities[104], Cities[105]));
		Country.fromName.set("Netherlands", new Country("Netherlands", -3008.0, -448.0, Cities[106], Cities[107], Cities[108]));
		Country.fromName.set("Denmark", new Country("Denmark", -1344.0, 1600.0, Cities[109], Cities[110], Cities[111]));
		Country.fromName.set("Norway", new Country("Norway", -1344.0, 6336.0, Cities[112], Cities[113], Cities[114], Cities[115], Cities[116], Cities[117], Cities[118]));
		Country.fromName.set("Sweden", new Country("Sweden", 704.0, 7744.0, Cities[119], Cities[120], Cities[121], Cities[122], Cities[123]));
		Country.fromName.set("Finland", new Country("Finland", 3648.0, 7744.0, Cities[124], Cities[125], Cities[126], Cities[127], Cities[128]));
		Country.fromName.set("England", new Country("England", -6848.0, 832.0, Cities[129], Cities[130], Cities[131], Cities[132]));
		Country.fromName.set("Ireland", new Country("Ireland", -11584.0, 2112.0, Cities[133], Cities[134], Cities[135]));
		Country.fromName.set("Iceland", new Country("Iceland", -7360.0, 9664.0, Cities[136], Cities[137], Cities[138], Cities[139]));
		Country.fromName.set("Svalbard", new Country("Svalbard", -1088.0, 14784.0, Cities[140], Cities[141]));
		Country.fromName.set("Estonia", new Country("Estonia", 4544.0, 4928.0, Cities[142], Cities[143]));
		Country.fromName.set("Latvia", new Country("Latvia", 4672.0, 3776.0, Cities[144], Cities[145]));
		Country.fromName.set("Lithuania", new Country("Lithuania", 4672.0, 2368.0, Cities[146], Cities[147]));
		Country.fromName.set("Kaliningrad", new Country("Kaliningrad", 3520.0, 1472.0, Cities[148], Cities[149]));
		Country.fromName.set("Belarus", new Country("Belarus", 6336.0, 1216.0, Cities[150], Cities[151], Cities[152], Cities[153]));
		Country.fromName.set("Malta", new Country("Malta", 1216.0, -12992.0, Cities[154], Cities[155]));
		Country.fromName.set("North Russia", new Country("North Russia", 9536.0, 8896.0, Cities[156], Cities[157], Cities[158], Cities[159], Cities[160], Cities[161], Cities[162]));
		Country.fromName.set("Slovakia", new Country("Slovakia", 3136.0, -2496.0, Cities[163], Cities[164]));
		Country.fromName.set("Hungary", new Country("Hungary", 3520.0, -3776.0, Cities[165], Cities[166]));
		Country.fromName.set("Sicily", new Country("Sicily", 960.0, -10816.0, Cities[167], Cities[168]));
		Country.fromName.set("Disko Bay", new Country("Disko Bay", -11072.0, 14272.0, Cities[169], Cities[170], Cities[171]));
		Country.fromName.set("East Greenland", new Country("East Greenland", -6464.0, 14784.0, Cities[172], Cities[173]));
		Country.fromName.set("Sami", new Country("Sami", 3776.0, 13376.0, Cities[174], Cities[175]));
		Country.fromName.set("Scotland", new Country("Scotland", -7488.0, 5056.0, Cities[176], Cities[177], Cities[178]));
		Country.fromName.set("Novaya", new Country("Novaya", 10816.0, 15808.0, Cities[179], Cities[180]));
		Country.fromName.set("Crimea", new Country("Crimea", 10944.0, -3904.0, Cities[181], Cities[182]));
		Country.fromName.set("Azerbaijan", new Country("Azerbaijan", 17984.0, -4288.0, Cities[183], Cities[184]));
		Country.fromName.set("Armenia", new Country("Armenia", 17984.0, -5952.0, Cities[185]));
		Country.fromName.set("Southern Russia", new Country("Southern Russia", 15936.0, -320.0, Cities[186], Cities[187], Cities[188], Cities[189], Cities[190]));
		Country.fromName.set("Volga", new Country("Volga", 17088.0, 5184.0, Cities[191], Cities[192], Cities[193]));
		Country.fromName.set("Central Russia", new Country("Central Russia", 11584.0, 3392.0, Cities[194], Cities[195], Cities[196], Cities[197], Cities[198]));
		Country.fromName.set("Siberia", new Country("Siberia", 17216.0, 15424.0, Cities[199], Cities[200]));
		Country.fromName.set("Moscow", new Country("Moscow", 14528.0, 8768.0, Cities[201], Cities[202]));
		Country.fromName.set("National Park", new Country("National Park", -8640.0, 14400.0, Cities[203], Cities[204], Cities[205]));
		Country.fromName.set("West Greenland", new Country("West Greenland", -12864.0, 13888.0, Cities[206], Cities[207]));
		Country.fromName.set("Wales", new Country("Wales", -8384.0, 1472.0, Cities[208], Cities[209]));
		Country.fromName.set("Sardinia", new Country("Sardinia", -1856.0, -8256.0, Cities[210], Cities[211]));
		Country.fromName.set("Crete", new Country("Crete", 7616.0, -11712.0, Cities[212], Cities[213]));
		Country.fromName.set("Cyprus", new Country("Cyprus", 12608.0, -10944.0, Cities[214], Cities[215]));
	}

	//Public API
	public get cities(): City[] {
		return this._cities;
	}

	public get size() {
		return this.cities.length;
	}

	public get owner(): player {
		return this._owner;
	}

	public animate() {
		if (this.owner == NEUTRAL_HOSTILE ) return;

		this.cities.forEach(city => {
			const effect = AddSpecialEffect("Abilities\\Spells\\Human\\Resurrect\\ResurrectCaster.mdl", GetUnitX(city.barrack), GetUnitY(city.barrack));
			BlzSetSpecialEffectScale(effect, 1.10);
			DestroyEffect(effect);
		});
	}

	public initCitiesOwned() {
		GamePlayer.fromPlayer.forEach(gPlayer => {
			if (GetPlayerId(gPlayer.player) >= 25) return;

			this.citiesOwned.set(gPlayer, 0);
		});
	}

	public isOwned(): boolean {
		return this.owner == NEUTRAL_HOSTILE ? false : true
	}

	public step() {
		this.spawner.step();
	}

	public setOwner(who: player) {
		if (who == this.owner) return;

		GamePlayer.fromPlayer.get(this.owner).income -= this.cities.length;

		GamePlayer.fromPlayer.get(who).income += this.cities.length;
		this._owner = who;
		this.spawner.setOwner(who);

		this.animate();
		DisplayTimedTextToPlayer(who, 0.82, 0.81, 3.00, `${HexColors.TANGERINE}${this.name}|r has been conquered!`);
	    
		PlayLocalSound("Sound\\Interface\\Rescue.flac", who);
	}

	public reset() {
		this._owner = NEUTRAL_HOSTILE;
		this.spawner.reset();
		this.initCitiesOwned();
	}
	//Internal Functions
}