import { City } from "./city-type";
import { Spawner } from "./spawner-type";

export class Country {
    private name: string;
    private cities: City[] = [];
    private spawner: Spawner;
    private text: texttag;

    public static fromSpawner = new Map<Spawner, Country>();
    public static fromCity = new Map<City, Country>();

    constructor(name: string, x: number, y: number, ...cities: City[]) {
        this.name = name;

        cities.forEach(city => {
            this.cities.push(city);
        });

        this.setSpanwer(name, x, y, this.cities.length);
        this.setText();
    }

    setSpanwer(countryName: string, x: number, y: number, countrySize: number) {
        this.spawner = new Spawner(countryName, x, y, countrySize);
    }

    setText() {

    }

    animate() {
        
    }
}