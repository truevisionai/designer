/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { XmlElement } from '../../../tv-map/services/open-drive-parser.service';
import { Position } from '../position';
import { PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';

export class RelativeLanePosition extends Position {

	public readonly label: string = 'Relative Lane Position';
	public readonly type = PositionType.RelativeLane;

	constructor (
		public entityRef: string,
		public dLane: number,
		public ds: number,
		public offset: number,
		public dsLane: number,
		public orientation: Orientation
	) {
		super();
	}


	exportXml () {
		throw new Error( 'Method not implemented.' );
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

	toXML (): XmlElement {
		return undefined;
	}


}
