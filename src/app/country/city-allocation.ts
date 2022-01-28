export class CityAllocation {
    public static instance: CityAllocation;

    private constructor() {}

    public static getInstance() {
        if (this.instance == null) {
            this.instance = new CityAllocation();
        }

        return this.instance;
    }

    public start() {

    }

}