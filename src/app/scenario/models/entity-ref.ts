/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

// import { ScenarioInstance } from '../services/scenario-instance';
import { ScenarioEntity } from './entities/scenario-entity';

export class EntityRef {

	constructor (
		private entityRef: string | ScenarioEntity
	) {
	}

	get entity (): ScenarioEntity {

		if ( this.entityRef instanceof ScenarioEntity ) {
			return this.entityRef;
		}

		throw new Error( 'method not implemented' );
		// return ScenarioInstance.scenario.findEntityOrFail( this.entityRef );
	}

	get name (): string {

		if ( this.entityRef instanceof ScenarioEntity ) {
			return this.entityRef.name;
		}

		return this.entityRef;
	}

	set name ( value: string ) {

		this.entityRef = value;

	}

}
