/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { StoryEvent } from '../services/scenario-director.service';
import { ScenarioInstance } from '../services/scenario-instance';
import { TvAction } from './tv-action';
import { StoryElementState, StoryElementType } from './tv-enums';
import { TvEvent } from './tv-event';
import { ParameterDeclaration } from './tv-parameter-declaration';

/**
 * one Maneuver is used to group instances of Event.
 * Two instances of Maneuver may also be used, each hosting
 * one Event. Both alternatives yield the same simulation
 * outcome, as long as each Event retain its startTrigger.
 */
export class Maneuver {

	private static count = 1;

	public parameterDeclaration: ParameterDeclaration;

	public events: TvEvent[] = [];

	public hasStarted: boolean;
	public isCompleted: boolean;
	public eventIndex: number = 0;

	public completed = new EventEmitter<StoryEvent>();

	constructor ( public name: string ) {

		Maneuver.count++;

	}

	static getNewName ( name = 'MyManeuver' ) {

		return `${ name }${ this.count }`;

	}

	addNewEvent ( name: string, priority: string ) {

		const hasName = ScenarioInstance.db.has_event( name );

		if ( hasName ) throw new Error( 'Event name already used' );

		const event = new TvEvent( name, priority );

		this.addEventInstance( event );

		return event;
	}

	addEventInstance ( event: TvEvent ) {

		this.events.push( event );

		ScenarioInstance.db.add_event( event.name, event );

		event.completed.subscribe( e => this.onEventCompleted( e ) );

		return event;

	}

	private onEventCompleted ( storyEvent: StoryEvent ) {

		this.eventIndex++;

		let allCompleted = true;

		for ( const event of this.events ) {

			if ( !event.isCompleted ) {

				allCompleted = false;

				break;

			}
		}

		if ( allCompleted ) {

			this.isCompleted = true;

			this.completed.emit( {
				name: this.name,
				type: StoryElementType.maneuver,
				state: StoryElementState.completed
			} );

		}
	}
}

export class EventAction {

	public name: string;
	public action: TvAction;

}
