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

	constructor ( public road: TvRoad, public section: TvLaneSection, public lane: TvLane, public s: number, public offset: number ) {

	}

	init () {

	}

	addTrackCoord ( value: TvRoadCoord ) {

	}

	get roadId (): number {
		return this.road?.id;
	}

	get laneSectionId (): number {
		return this.section?.id;
	}

	get laneId (): number {
		return this.lane?.id;
	}

	get posTheta () {
		throw new Error( 'method not implemented' );
		// TODO: check if this is correct
		// return this.road?.getRoadCoordAt( this.s, 0 );
		// const posTheta = new TvPosTheta();
		// TvMapQueries.getLaneStartPosition( this.roadId, this.laneId, this.s, this.offset, posTheta )
		// return posTheta;
	}

	get position (): Vector3 {
		throw new Error( 'method not implemented' );
		// return this.posTheta.toVector3();
	}

	get direction (): Vector3 {
		throw new Error( 'method not implemented' );
		// return this.posTheta.toDirectionVector();
	}
}

