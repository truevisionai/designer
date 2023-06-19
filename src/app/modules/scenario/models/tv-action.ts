import { EventEmitter } from '@angular/core';
import { MathUtils, Vector3 } from 'three';
import { StoryEvent } from '../services/scenario-director.service';
import { TvScenarioInstance } from '../services/tv-scenario-instance';
import { EntityObject } from './tv-entities';
import { ActionCategory, ActionType } from './tv-enums';

export abstract class TvAction {

	abstract category: ActionCategory;
	abstract actionType: ActionType;

	public readonly uuid = MathUtils.generateUUID();

	public isCompleted: boolean;
	public hasStarted: boolean;
	public completed = new EventEmitter<StoryEvent>();

	execute ( entity: EntityObject ) {
		console.error( this.actionType, this.category );
		throw new Error( 'Method not implemented' );
	}

	reset () {

		this.hasStarted = false;
		this.isCompleted = false;

	}

	protected get scenario () {
		return TvScenarioInstance.scenario;
	}

	protected getEntity ( entityName: string ): EntityObject {
		return this.scenario.findEntityOrFail( entityName );
	}

	protected getEntityPosition ( entityName: string ): Vector3 {
		return this.scenario.getEntityVectorPosition( entityName );
	}

	protected getEntitySpeed ( entityName: string ): number {
		return this.scenario.findEntityOrFail( entityName ).getCurrentSpeed();
	}
}
