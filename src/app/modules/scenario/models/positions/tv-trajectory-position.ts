/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { TvMapQueries } from '../../../tv-map/queries/tv-map-queries';
import { Position } from '../position';
import { OpenScenarioVersion, PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';
import { CatalogReference } from '../tv-catalogs';

export class TrajectoryPosition extends Position {

	public readonly label: string = 'Trajectory Position';
	public readonly type = PositionType.Lane;

	constructor (
		public s: number,
		public t: number,
		public trajectoryRef: CatalogReference,
		public orientaion: Orientation = null,
	) {

		super();

	}

	toVector3 (): Vector3 {

		throw new Error( 'Method not implemented.' );

	}

}
