export class Alliances {
	private static instance: Alliances;

	constructor() {
	}

	public static getInstance(): Alliances {
		if (this.instance == null) {
			this.instance = new Alliances();
		}

		return this.instance;
	}
}