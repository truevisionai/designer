/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { Position } from '../position';
import { PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';

export class RelativeWorldPosition extends Position {

	public readonly label: string = 'Relative World Position';
	public readonly type = PositionType.RelativeWorld;

	private object: string;
	private dx: number;
	private dy: number;
	private dz: number;
	private orientation: Orientation;

	exportXml () {

		throw new Error( 'Method not implemented.' );

	}

	toVector3 (): Vector3 {

		console.error( 'Method not implemented.' );

		return new Vector3();

	}


}
