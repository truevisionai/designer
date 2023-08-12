/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { TvMapQueries } from '../../../tv-map/queries/tv-map-queries';
import { Position } from '../position';
import { OpenScenarioVersion, PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';

export class LanePosition extends Position {

	public readonly label: string = 'Lane Position';
	public readonly type = PositionType.Lane;
	public readonly isDependent: boolean = false;

	public roadId: number;
	public laneId: number;
	public offset: number;
	public sCoordinate: number;

	constructor ( roadId = 0, laneId = 0, offset = 0, s = 0, orientation: Orientation = null ) {

		super( null, orientation );

		this.roadId = roadId;
		this.laneId = laneId;
		this.offset = offset;
		this.sCoordinate = s;

	}

	getVectorPosition (): Vector3 {

		if ( this.roadId != 0 && this.roadId != null && this.laneId != null && this.sCoordinate != null ) {

			return TvMapQueries.getLaneCenterPosition( this.roadId, this.laneId, this.sCoordinate, this.offset );

		} else {

			console.error( 'invalid parameters' );

			return new Vector3();
		}

	}

	toXML ( version: OpenScenarioVersion ) {

		const key = version == OpenScenarioVersion.v0_9 ? 'Lane' : 'LanePosition';

		return {
			[ key ]: {
				attr_roadId: this.roadId,
				attr_laneId: this.laneId,
				attr_s: this.sCoordinate,
				attr_offset: this.offset ? this.offset : 0,
				Orientation: this.orientation?.toXML( version )
			}
		};
	}

	getLaneArray () {
		return TvMapQueries.findRoadById( this.roadId ).getLaneSectionAt( this.sCoordinate ).getLaneArray();
	}
}
