/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { TvRoad } from './tv-road.model';
import { TvLaneSection } from "./tv-lane-section";
import { TvLane } from "./tv-lane";
import { TvContactPoint } from './tv-common';
import { Maths } from 'app/utils/maths';
import { Orientation } from 'app/scenario/models/tv-orientation';

export class TvLaneCoord {

	constructor (
		public road: TvRoad,
		public laneSection: TvLaneSection,
		public lane: TvLane,
		public s: number,
		public offset: number
	) {

	}

	get contact (): TvContactPoint {

		if ( Maths.approxEquals( this.s, 0 ) ) return TvContactPoint.START;

		if ( Maths.approxEquals( this.s, this.road.length ) ) return TvContactPoint.END;

		console.error( `TvRoadCoord.contact: s is not 0 or length ${ this.s } ${ this.road.length }` );
	}

	get roadId (): number {
		return this.road?.id;
	}

	get laneSectionId (): number {
		return this.laneSection?.id;
	}

	get laneId (): number {
		return this.lane?.id;
	}

	get posTheta () {
		return this.road.getLaneStartPosition( this.lane, this.s, this.offset );
	}

	get position (): Vector3 {
		return this.posTheta.toVector3();
	}

	get direction (): Vector3 {
		return this.posTheta.toDirectionVector();
	}

	get laneDirection (): Vector3 {
		if ( this.lane.inRoadDirection ) {
			return this.direction;
		} else {
			return this.direction.negate();
		}
	}

	get orientation (): Orientation {
		// let h = this.h;
		// if ( this.t > 0 ) h += Math.PI;
		// return new Orientation( h, this.p, this.r );
		return new Orientation( 0, 0, 0 );
	}

	toPosTheta () {
		return this.posTheta;
	}

}

