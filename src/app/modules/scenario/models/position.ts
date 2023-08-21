/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Euler, Vector3 } from 'three';
import { ScenarioInstance } from '../services/scenario-instance';
import { ScenarioEntity } from './entities/scenario-entity';
import { OpenScenarioVersion, PositionType } from './tv-enums';
import { Orientation } from './tv-orientation';
import { EventEmitter } from '@angular/core';

export abstract class Position {

	abstract readonly type: PositionType;

	abstract readonly label: string;

	abstract readonly isDependent: boolean;

	abstract getVectorPosition (): Vector3;

	abstract updateFromWorldPosition ( position: Vector3, orientation: Orientation ): void;

	public updated = new EventEmitter();

	constructor (
		protected vector0: Vector3,
		public orientation: Orientation
	) {
	}

	setPosition ( value: Vector3 ) {
		if ( !this.vector0 ) this.vector0 = new Vector3();
		this.vector0.copy( value )
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
		if ( this.orientation ) {
			this.orientation.copy( orientation )
		} else {
			this.orientation = orientation
		}
	}

}
