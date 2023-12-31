export class TvUserData {

	constructor (
		public attr_code: string,
		public attr_value: any
	) {
	}

	clone (): TvUserData {
		return new TvUserData(
			this.attr_code,
			this.attr_value
		);
	}
}
