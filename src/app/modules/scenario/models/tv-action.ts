import { EventEmitter } from '@angular/core';
import { MathUtils, Vector3 } from 'three';
import { StoryboardEvent } from '../services/scenario-director.service';
import { ScenarioInstance } from '../services/scenario-instance';
import { ScenarioEntity } from './entities/scenario-entity';
import { ActionCategory, ActionType } from './tv-enums';

export abstract class TvAction {

	abstract category: ActionCategory;
	abstract actionType: ActionType;
	abstract label: string;

	abstract execute ( entity: ScenarioEntity ): void;

	public readonly uuid = MathUtils.generateUUID();

	public isCompleted: boolean;
	public hasStarted: boolean;
	public completed = new EventEmitter<StoryboardEvent>();

	public name: string;

	reset () {

		this.hasStarted = false;
		this.isCompleted = false;

	}

	protected get scenario () {
		return ScenarioInstance.scenario;
	}

	protected getEntity ( entityName: string ): ScenarioEntity {
		return this.scenario.findEntityOrFail( entityName );
	}

	protected getEntityPosition ( entityName: string ): Vector3 {
		return this.scenario.getEntityVectorPosition( entityName );
	}

	protected getEntitySpeed ( entityName: string ): number {
		return this.scenario.findEntityOrFail( entityName ).getCurrentSpeed();
	}

	setName ( name: string ) {
		this.name = name;
	}
}
