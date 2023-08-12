/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { Position } from '../position';
import { CatalogReference } from '../tv-catalogs';
import { PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';

export class TrajectoryPosition extends Position {

	public readonly label: string = 'Trajectory Position';
	public readonly type = PositionType.Lane;
	public readonly isDependent: boolean = false;

	constructor (
		public s: number,
		public t: number,
		public trajectoryRef: CatalogReference,
		orientaion: Orientation = null,
	) {

		super( null, orientaion );

	}

	getVectorPosition (): Vector3 {

		throw new Error( 'Method not implemented.' );

	}

}
