/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'app/core/maths';
import { Position } from '../position';
import { PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';

export class RelativeRoadPosition extends Position {

	readonly label: string = 'RelativeRoadPosition';
	readonly type: PositionType = PositionType.RelativeRoad;
	readonly isDependent: boolean = true;


	constructor (
		public entity: string,
		public roadId: number,
		public ds: number,
		public dt: number,
		orientation: Orientation
	) {
		super( null, orientation );
	}

	getVectorPosition (): Vector3 {
		throw new Error( 'Method not implemented.' );
	}

	updateFromWorldPosition ( position: Vector3, orientation: Orientation ): void {

		throw new Error( 'Method not implemented.' );

	}

}
