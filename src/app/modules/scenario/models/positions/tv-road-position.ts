/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { Position } from '../position';
import { PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';

export class RoadPosition extends Position {

	public readonly label: string = 'Road Position';
	public readonly type = PositionType.Road;

	private roadId: number;
	private sValue: number;
	private tValue: number;
	private orientation: Orientation;

	constructor ( roadId = 0, sValue = 0, tValue = 0, orientation: Orientation = null ) {

		super();

		this.roadId = roadId;
		this.sValue = sValue;
		this.tValue = tValue;
		this.orientation = orientation;

	}

	exportXml () {

		throw new Error( 'Method not implemented.' );

	}

	toVector3 (): Vector3 {

		console.error( 'Method not implemented.' );

		return new Vector3();

	}

}
