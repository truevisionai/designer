/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class TvUserData {

	constructor (
		public code: string,
		public value: any
	) {
	}

	clone (): TvUserData {
		return new TvUserData(
			this.code,
			this.value
		);
	}
}
