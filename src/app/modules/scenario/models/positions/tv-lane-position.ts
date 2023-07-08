/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { TvMapQueries } from '../../../tv-map/queries/tv-map-queries';
import { Position } from '../position';
import { PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';

export class LanePosition extends Position {

	public readonly label: string = 'Lane Position';
	public readonly type = PositionType.Lane;

	public roadId: number;
	public laneId: number;
	public offset: number;
	public sCoordinate: number;
	public orientation: Orientation;

	constructor ( roadId = 0, laneId = 0, offset = 0, s = 0, orientation: Orientation = null ) {

		super();

		this.roadId = roadId;
		this.laneId = laneId;
		this.offset = offset;
		this.sCoordinate = s;
		this.orientation = orientation;

	}

	toVector3 (): Vector3 {

		if ( this.roadId != 0 && this.roadId != null && this.laneId != null && this.sCoordinate != null ) {

			return TvMapQueries.getLaneCenterPosition( this.roadId, this.laneId, this.sCoordinate, this.offset );

		} else {

			console.error( 'invalid parameters' );

			return new Vector3();
		}

	}

	toXML () {
		return {
			Lane: {
				attr_roadId: this.roadId,
				attr_laneId: this.laneId,
				attr_s: this.sCoordinate,
				attr_offset: this.offset ? this.offset : 0,
			}
		};
	}

	getLaneArray () {
		return TvMapQueries.findRoadById( this.roadId ).getLaneSectionAt( this.sCoordinate ).getLaneArray();
	}
}
