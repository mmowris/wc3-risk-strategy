interface Team {
	num: number;
	members: [];
}

export class Alliances {
	private static instance: Alliances;


	public static getInstance() {
		if (this.instance == null) {
			this.instance = new Alliances();
		}
		return this.instance;
	}
}