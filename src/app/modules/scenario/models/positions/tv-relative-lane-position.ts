/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { XmlElement } from '../../../tv-map/services/open-drive-parser.service';
import { Position } from '../position';
import { OpenScenarioVersion, PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';

export class RelativeLanePosition extends Position {

	public readonly label: string = 'Relative Lane Position';
	public readonly type = PositionType.RelativeLane;

	/**
	 *
	 * @param entityRef Reference entity.
	 * @param dLane The deviation value between the laneId of the lane,
	 * where the reference entity is located, and the target laneId.
	 * @param ds The offset along the road's reference line relative to the
	 * s-coordinate of the reference entity. Mutually exclusive with dsLane. Unit: [m].
	 * @param offset The lateral offset to the center line of the target lane
	 * (along the normal to the road's reference line). Missing value is interpreted as 0.
	 * The positive value means the offset is applied in the direction of the
	 * t-axis being imagined at the target s-position. Unit: [m].
	 * @param dsLane The offset along the center line of the lane, where the
	 * reference entity is located. Mutually exclusive with ds. Unit: [m].
	 * @param orientation
	 */
	constructor (
		public entityRef: string,
		public dLane: number,
		public ds: number,
		public offset: number = 0,
		public dsLane: number = 0,
		public orientation: Orientation = null
	) {
		super();
	}


	toXML ( version?: OpenScenarioVersion ) {

		return {
			attr_entityRef: this.entityRef,
			attr_dLane: this.dLane,
			attr_ds: this.ds,
			attr_offset: this.offset,
			attr_dsLane: this.dsLane,
			Orientation: this.orientation?.toXML( version ),
		}

	}

	static fromXML ( xml: XmlElement ): RelativeLanePosition {

		return new RelativeLanePosition(
			xml.attr_entityRef,
			xml.attr_dLane,
			xml.attr_ds,
			xml.attr_offset,
			xml.attr_dsLane,
			Orientation.fromXML( xml.Orientation )
		);

	}

	toVector3 (): Vector3 {

		throw new Error( 'Method not implemented.' );

		// if ( !this.entityRef ) TvConsole.info( 'No object reference found for relative lane position' );
		// if ( !this.entityRef ) return new Vector3();
		//
		// const object = this.getEntity( this.entityRef );
		//
		// const laneId = object.laneId + this.dLane;
		// const roadId = object.roadId;
		// const sCoordinate = object.sCoordinate + this.ds;
		// const offset = object.getCurrentLaneOffset() + this.offset;
		//
		// return TvMapQueries.getLanePosition( roadId, laneId, sCoordinate, offset );

	}

}
