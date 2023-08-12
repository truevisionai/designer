/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Euler, Vector3 } from 'three';
import { ScenarioInstance } from '../services/scenario-instance';
import { ScenarioEntity } from './entities/scenario-entity';
import { OpenScenarioVersion, PositionType } from './tv-enums';
import { Orientation } from './tv-orientation';

export abstract class Position {

	abstract readonly type: PositionType;

	abstract readonly label: string;

	abstract readonly isDependent: boolean;

	abstract getVectorPosition (): Vector3;

	constructor (
		private _vector3: Vector3,
		public orientation: Orientation
	) {
	}

	get vector3 (): Vector3 {
		return this._vector3;
	}

	setPosition ( value: Vector3 ) {
		this._vector3 = value;
	}

	toEuler (): Euler {
		return this.orientation?.toEuler() || new Euler( 0, 0, 0 );
	}

	get position (): Vector3 {
		return this.getVectorPosition();
	}

	protected getEntity ( entity: string ): ScenarioEntity {
		return ScenarioInstance.scenario.findEntityOrFail( entity );
	}

	toXML ( version?: OpenScenarioVersion ) {
		return {};
	}

	setOrientationV2 ( orientation: Orientation ) {
		this.orientation = orientation;
	}
}
