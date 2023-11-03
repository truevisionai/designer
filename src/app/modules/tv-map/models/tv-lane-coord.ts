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

	constructor ( public roadId: number, public sectionId: number, public laneId: number, public s: number, public offset: number ) {

	}

	init () {

	}

	addTrackCoord ( value: TvRoadCoord ) {

	}

	get road (): TvRoad {
		throw new Error( 'method not implemented' );
		// return TvMapInstance.map.getRoadById( this.roadId );
	}

	get laneSection (): TvLaneSection {
		return this.road?.getLaneSectionById( this.sectionId );
	}

	get lane (): TvLane {
		return this.laneSection?.getLaneById( this.laneId );
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

