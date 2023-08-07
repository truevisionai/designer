/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { TvMapInstance } from '../services/tv-map-source-file';
import { TvRoad } from './tv-road.model';

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

	static getDist2d ( a: TvCoord, b: TvCoord ) {
		const dx = a.x - b.x;
		const dy = a.y - b.y;
		return Math.sqrt( dx * dx + dy * dy );
	}

	static getDist3d ( a: TvCoord, b: TvCoord ) {
		const dx = a.x - b.x;
		const dy = a.y - b.y;
		const dz = a.z - b.z;
		return Math.sqrt( dx * dx + dy * dy + dz * dz );
	}
}

export class TvLaneCoord {

	// total 4 properties
	// road-id
	// lane-section-id
	// s
	// lane-Id
	// lane-offset

	constructor ( public roadId: number, public sectionId: number, public laneId: number, public s: number, public offset: number ) {

	}

	init () {

	}

	addTrackCoord ( value: TvRoadCoord ) {

	}

}

export class TvRoadCoord {

	constructor ( public roadId, public s: number, public t: number = 0, public z: number = 0, public h?, public p?, public r?) {

	}

	get road (): TvRoad {
		return TvMapInstance.map.getRoadById( this.roadId );
	}

	init () { }

	add ( value: TvRoadCoord ) { }

	toPosTheta () {
		return this.road?.getRoadCoordAt( this.s, this.t );
	}

	get position (): Vector3 {
		return this.toPosTheta().toVector3();
	}

	get rotation (): Vector3 {
		return new Vector3( this.r, this.p, this.h );
	}

}

export class TvGeoCoord {

	constructor ( lat, long, z, h, p, r ) {
	}
}
