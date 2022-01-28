import { HexColors } from "resources/hexColors";
import { City } from "./city-type";
import { Spawner } from "./spawner-type";

export class Country {
    private name: string;
    private cities: City[] = [];
    private spawner: Spawner;
    private text: texttag;

    private static _fromName = new Map<string, Country>();
    private static _fromSpawner = new Map<Spawner, Country>();
    private static _fromCity = new Map<City, Country>();

    constructor(name: string, x: number, y: number, ...cities: City[]) {
        this.name = name;

        cities.forEach(city => {
            this.cities.push(city);
        });

        this.setSpawner(x, y, this.cities.length);
        this.setText(x, y);

        Country.fromName.set(name, this);
    }

    //Static API
    public static get fromCity() {
        return Country._fromCity;
    }

    public static get fromName() {
        return Country._fromName;
    }

    public static get fromSpawner() {
        return Country._fromSpawner;
    }


    //Public API
    public animate() {
        this.cities.forEach(city => {
            const effect = AddSpecialEffect("Abilities\\Spells\\Human\\Resurrect\\ResurrectCaster.mdl", GetUnitX(city.barrack), GetUnitY(city.barrack));
            BlzSetSpecialEffectScale(effect, 1.10);
            DestroyEffect(effect);
        });
    }

    //Interal Functions
    private setSpawner(x: number, y: number, countrySize: number) {
        this.spawner = new Spawner(this.name, x, y, countrySize);
    }

    private setText(x: number, y: number) {
        let offsetX: number = GetUnitX(this.spawner.unit) - x;
        let offsetY: number = GetUnitY(this.spawner.unit) - y;
        let lengthCheck: number = this.name.length * 5.5 < 200 ? this.name.length * 5.5 : 200;

        this.text = CreateTextTag();
        SetTextTagText(this.text, `${HexColors.TANGERINE} ${this.name}`, 0.028);
        SetTextTagPos(this.text, offsetX - lengthCheck, offsetY, 16.00);
        SetTextTagVisibility(this.text, true);
        SetTextTagPermanent(this.text, true);
    }
}