/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { Position } from '../position';
import { OpenScenarioVersion, PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';

export class WorldPosition extends Position {

	public readonly label: string = 'World Position';
	public readonly type = PositionType.World;
	public readonly isDependent: boolean = false;

	constructor ( vector3: Vector3, orientation?: Orientation ) {

		super( vector3 || new Vector3(), orientation || new Orientation() );

	}

	getVectorPosition (): Vector3 {

		return this.vector3;

	}

	toXML ( version: OpenScenarioVersion ) {

		const key = version == OpenScenarioVersion.v0_9 ?
			'World' :
			'WorldPosition';

		return {
			[ key ]: {
				attr_x: this.vector3?.x ?? 0,
				attr_y: this.vector3?.y ?? 0,
				attr_z: this.vector3?.z ?? 0,
				attr_h: this.orientation?.h ?? 0,
				attr_p: this.orientation?.p ?? 0,
				attr_r: this.orientation?.r ?? 0,
			}
		};
	}
}
