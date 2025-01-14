/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { Euler, Vector3 } from "three";
// import { ScenarioInstance } from '../services/scenario-instance';
import { ScenarioEntity } from './entities/scenario-entity';
import { OpenScenarioVersion, PositionType } from './tv-enums';
import { Orientation } from './tv-orientation';

export abstract class Position {

	abstract readonly type: PositionType;

	abstract readonly label: string;

	abstract readonly isDependent: boolean;
	public updated = new EventEmitter();

	constructor (
		protected vector0: Vector3,
		public orientation: Orientation
	) {
	}

	get position (): Vector3 {
		return this.getVectorPosition();
	}

	abstract getVectorPosition (): Vector3;

	abstract updateFromWorldPosition ( position: Vector3, orientation: Orientation ): void;

	setPosition ( value: Vector3 ): void {
		if ( !this.vector0 ) this.vector0 = new Vector3();
		this.vector0.copy( value );
	}

	toEuler (): Euler {
		return this.orientation?.toEuler() || new Euler( 0, 0, 0 );
	}

	toXML ( version?: OpenScenarioVersion ): any {
		return {};
	}

	setOrientationV2 ( orientation: Orientation ): void {
		if ( this.orientation ) {
			this.orientation.copy( orientation );
		} else {
			this.orientation = orientation;
		}
	}

	protected getEntity ( entity: string ): ScenarioEntity {
		throw new Error( 'method not implemented' );
		// return ScenarioInstance.scenario.findEntityOrFail( entity );
	}

}
