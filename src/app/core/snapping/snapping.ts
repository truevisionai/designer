/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { Object3D, Vector3 } from 'three';
import { TvPosTheta } from '../../modules/tv-map/models/tv-pos-theta';

export interface ISnappable {
	move ( position: Vector3 ): void;

	snap ( strategy: ISnapStrategy ): void;
}

export interface IMovable {
	move ( position: Vector3 ): void;
}

export interface IHasLane {
	lane: TvLane;
}

export interface IHasSCoord {
	s: number;
}

export interface IHasRoad {
	road: TvRoad;
}

export interface ISnapStrategy {
	execute ( snappable: ISnappable, position: Vector3 ): void;
}

export interface IMoveStrategy {
	getPosTheta ( position: Vector3 ): TvPosTheta;

	getVector3 ( s: number ): Vector3;
}

export class LaneEndStrategy implements IMoveStrategy {

	constructor ( private lane: TvLane, private sValues: IHasSCoord[] = [] ) { }

	getPosTheta ( position: Vector3 ): TvPosTheta {

		const posTheta = this.lane.laneSection.road.getCoordAt( position );

		const s = posTheta.s - this.lane.laneSection.s;

		const laneEndPosition = this.getVector3( s );

		posTheta.x = laneEndPosition.x;
		posTheta.y = laneEndPosition.y;
		posTheta.z = laneEndPosition.z;
		posTheta.s = s;

		return posTheta;
	}

	getVector3 ( s: number ): Vector3 {

		return TvMapQueries.getLaneEndPosition( this.lane.roadId, this.lane.id, s );

	}
}

