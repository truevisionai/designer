/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
// import { TvMapInstance } from '../services/tv-map-instance';
import { TvRoad } from './tv-road.model';
import { TvLaneSection } from "./tv-lane-section";
import { TvLane } from "./tv-lane";
// import { TvMapQueries } from '../queries/tv-map-queries';
import { TvPosTheta } from './tv-pos-theta';
import { TvRoadCoord } from './TvRoadCoord';

export class TvLaneCoord {

	// total 4 properties
	// road-id
	// lane-section-id
	// s
	// lane-Id
	// lane-offset

	constructor (
		public road: TvRoad,
		public laneSection: TvLaneSection,
		public lane: TvLane,
		public s: number,
		public offset: number
	) {

	}

	init () {

	}

	addTrackCoord ( value: TvRoadCoord ) {

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
}

