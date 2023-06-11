/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { StoryEvent } from '../services/scenario-player.service';
import { TvScenarioInstance } from '../services/tv-scenario-instance';
import { AbstractCondition } from './conditions/osc-condition';
import { ConditionGroup } from './conditions/osc-condition-group';
import { StoryElementType } from './osc-enums';
import { AbstractAction } from './osc-interfaces';
import { ConditionService } from './condition-service';

export class Event {

	private static count = 1;

	public startConditionGroups: ConditionGroup[] = [];
	public isCompleted: boolean;
	public hasStarted: boolean;

	public completed = new EventEmitter<StoryEvent>();

	// public actions: EventAction[] = [];
	private actions: Map<string, AbstractAction> = new Map<string, AbstractAction>();

	constructor ( public name?: string, public priority?: string ) {

		Event.count++;

	}

	get startConditions () {

		let conditions = [];

		this.startConditionGroups.forEach( group => {
			group.conditions.forEach( condition => {
				conditions.push( condition );
			} );
		} );

		return conditions;
	}

	static getNewName ( name = 'MyEvent' ) {

		return `${ name }${ this.count }`;

	}

	addNewAction ( name: string, action: AbstractAction ) {

		const hasName = TvScenarioInstance.db.has_action( name );

		if ( hasName ) throw new Error( `Action name '${ name }' already used` );

		this.actions.set( name, action );

		TvScenarioInstance.db.add_action( name );

		action.completed.subscribe( e => {
			this.onActionCompleted( { name: name, type: StoryElementType.action } );
		} );
	}

	addStartCondition ( condition: AbstractCondition ) {

		const conditionGroup = this.createOrGetGroup();

		conditionGroup.addCondition( condition );

	}

	createOrGetGroup () {

		if ( this.startConditionGroups.length === 0 ) {

			this.startConditionGroups.push( new ConditionGroup() );

		}

		return this.startConditionGroups[ 0 ];
	}

	hasPassed () {

		return ConditionService.hasGroupsPassed( this.startConditionGroups );

	}

	getActions () {
		return [ ...this.actions.values() ];
	}

	getActionMap () {

		return this.actions;

	}

	private onActionCompleted ( e: StoryEvent ) {

		if ( e.type != StoryElementType.action ) return;

		this.actions.forEach( ( action, actionName ) => {

			if ( actionName === e.name ) action.isCompleted = true;

		} );

		let allCompleted = true;

		this.actions.forEach( ( action ) => {

			if ( !action.isCompleted ) allCompleted = false;

		} );

		if ( allCompleted ) {

			this.isCompleted = true;

			this.completed.emit( {
				name: this.name,
				type: StoryElementType.event
			} );
		}


	}
}
