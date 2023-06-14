import { EventEmitter } from '@angular/core';
import { StoryEvent } from '../services/scenario-director.service';
import { EntityObject } from './tv-entities';
import { ActionCategory, ActionType } from './tv-enums';

export abstract class AbstractAction {

	abstract category: ActionCategory;
	abstract actionType: ActionType;

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
