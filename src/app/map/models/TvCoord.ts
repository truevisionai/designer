/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */


export class TvCoord {

	constructor (
		public x,
		public y,
		public z,
		public h,
		public p,
		public r
	) {
	}

	static getDist2d ( a: TvCoord, b: TvCoord ): number {
		const dx = a.x - b.x;
		const dy = a.y - b.y;
		return Math.sqrt( dx * dx + dy * dy );
	}

	static getDist3d ( a: TvCoord, b: TvCoord ): number {
		const dx = a.x - b.x;
		const dy = a.y - b.y;
		const dz = a.z - b.z;
		return Math.sqrt( dx * dx + dy * dy + dz * dz );
	}
}
