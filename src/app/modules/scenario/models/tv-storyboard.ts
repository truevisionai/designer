/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GlobalAction } from './actions/tv-global-action';
import { UserDefinedAction } from './actions/tv-user-defined-action';
import { Condition } from './conditions/tv-condition';
import { ConditionGroup } from './conditions/tv-condition-group';
import { PrivateAction } from './private-action';
import { TvEvent } from './tv-event';
import { Story } from './tv-story';

export class Storyboard {

	public stories: Map<string, Story> = new Map<string, Story>();
	public endConditionGroups: ConditionGroup[] = [];
	public initActions = new InitActions();

	addStory ( story: Story ) {

		// const hasName = ScenarioInstance.db.has_story( story.name );
		//
		// if ( hasName ) throw new Error( `Story name '${ story.name }' has already been used` );

		this.stories.set( story.name, story );

		// ScenarioInstance.db.add_story( story.name, story );

	}

	addNewStory ( name: string, owner?: string ): Story {

		const story = new Story( name, owner );

		this.addStory( story );

		return story;

	}

	addEndConditionGroup ( group: ConditionGroup ) {

		this.endConditionGroups.push( group );

	}

	addEndCondition ( condition: Condition ) {

		if ( this.endConditionGroups.length > 0 ) {

			this.endConditionGroups[ 0 ].addCondition( ( condition ) );

		} else {

			const group = new ConditionGroup();

			group.addCondition( condition );

			this.addEndConditionGroup( group );

		}

	}


	removeEvent ( event: TvEvent ) {

		this.stories.forEach( story => {

			story.acts.forEach( act => {

				act.maneueverGroups.forEach( maneuverGroup => {

					maneuverGroup.maneuvers.forEach( maneuver => {

						maneuver.events = maneuver.events.filter( e => e !== event );

					} );

				} );

			} );

		} );

	}

}


export class InitActions {

	private globalActions: GlobalAction[] = [];
	private userDefinedActions: UserDefinedAction[] = [];
	private entities = new Map<string, PrivateAction[]>();

	addPrivateAction ( owner: string, action: PrivateAction ): any {

		if ( !this.entities.has( owner ) ) this.entities.set( owner, [] );

		this.entities.get( owner ).push( action );

	}

}
