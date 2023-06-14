/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { StoryEvent } from '../services/scenario-director.service';
import { TvScenarioInstance } from '../services/tv-scenario-instance';
import { ConditionUtils } from '../builders/condition-utils';
import { AbstractAction } from './abstract-action';
import { AbstractCondition } from './conditions/tv-condition';
import { ConditionGroup } from './conditions/tv-condition-group';
import { StoryElementType } from './tv-enums';

export class TvEvent {

	private static count = 1;

	public startConditionGroups: ConditionGroup[] = [];
	public isCompleted: boolean;
	public hasStarted: boolean;

	public completed = new EventEmitter<StoryEvent>();

	// public actions: EventAction[] = [];
	private _actions: Map<string, AbstractAction> = new Map<string, AbstractAction>();

	constructor ( public name?: string, public priority?: string ) {

		TvEvent.count++;

	}

	get actions (): Map<string, AbstractAction> {
		return this._actions;
	}

	set actions ( value: Map<string, AbstractAction> ) {
		this._actions = value;
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

		this._actions.set( name, action );

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

		return ConditionUtils.hasGroupsPassed( this.startConditionGroups );

	}

	getActions (): AbstractAction[] {

		return [ ...this._actions.values() ];

	}

	getActionMap () {

		return this._actions;

	}

	removeCondition ( $condition: AbstractCondition ) {

		for ( let i = 0; i < this.startConditionGroups.length; i++ ) {

			const group = this.startConditionGroups[ i ];

			for ( let j = 0; j < group.conditions.length; j++ ) {

				const condition = group.conditions[ j ];

				if ( condition === $condition ) {

					group.conditions.splice( j, 1 );

					// if ( group.conditions.length === 0 ) {

					// 	this.startConditionGroups.splice( i, 1 );

					// }

					return;

				}

			}

		}

	}


	private onActionCompleted ( e: StoryEvent ) {

		if ( e.type != StoryElementType.action ) return;

		this._actions.forEach( ( action, actionName ) => {

			if ( actionName === e.name ) action.isCompleted = true;

		} );

		let allCompleted = true;

		this._actions.forEach( ( action ) => {

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
