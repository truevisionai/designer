/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { MathUtils, Vector3 } from 'three';
import { StoryboardEvent } from '../services/scenario-director.service';
// import { ScenarioInstance } from '../services/scenario-instance';
import { ScenarioEntity } from './entities/scenario-entity';
import { ActionCategory, ActionType } from './tv-enums';

export abstract class TvAction {

	abstract category: ActionCategory;
	abstract actionType: ActionType;
	abstract label: string;
	public readonly uuid = MathUtils.generateUUID();
	public isCompleted: boolean;
	public hasStarted: boolean;
	public completed = new EventEmitter<StoryboardEvent>();
	public updated = new EventEmitter<TvAction>();
	public name: string;

	protected get scenario () {
		throw new Error( 'method not implemented' );
		// return ScenarioInstance.scenario;
	}

	abstract execute ( entity: ScenarioEntity ): void;

	reset () {

		this.hasStarted = false;
		this.isCompleted = false;

	}

	setName ( name: string ) {
		this.name = name;
	}

	protected getEntity ( entityName: string ): ScenarioEntity {
		throw new Error( 'method not implemented' );
		// return this.scenario.findEntityOrFail( entityName );
	}

	protected getEntityPosition ( entityName: string ): Vector3 {
		throw new Error( 'method not implemented' );
		// return this.scenario.getEntityVectorPosition( entityName );
	}

	protected getEntitySpeed ( entityName: string ): number {
		throw new Error( 'method not implemented' );
		// return this.scenario.findEntityOrFail( entityName ).getCurrentSpeed();
	}
}
