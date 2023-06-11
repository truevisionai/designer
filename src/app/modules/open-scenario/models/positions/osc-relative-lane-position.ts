/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { PositionType } from '../osc-enums';
import { AbstractPosition } from '../osc-interfaces';
import { Orientation } from '../osc-orientation';

export class RelativeLanePosition extends AbstractPosition {

	public readonly type = PositionType.RelativeLane;

	public object: string;
	public dLane: number;
	public ds: number;
	public offset?: number;

	public orientations: Orientation[] = [];

	exportXml () {

		throw new Error( 'Method not implemented.' );

	}

	toVector3 (): Vector3 {

		console.error( 'Method not implemented.' );

		return new Vector3();

	}


}
