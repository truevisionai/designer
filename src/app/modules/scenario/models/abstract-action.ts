import { EventEmitter } from '@angular/core';
import { StoryEvent } from '../services/scenario-director.service';
import { EntityObject } from './tv-entities';
import { ActionCategory, ActionType } from './tv-enums';
import { MathUtils } from 'three';

export abstract class AbstractAction {

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
}
