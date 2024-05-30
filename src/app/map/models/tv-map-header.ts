/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class TvMapHeader {

	constructor (
		public revMajor: number = 1,
		public revMinor: number = 4,
		public name: string = "Untitled",
		public version: number = 1,
		public date: string = new Date().toISOString(),
		public north: number = 1,
		public south: number = 0,
		public east: number = 0,
		public west: number = 0,
		public vendor: string = "Truevision.ai"
	) {
	}

}
