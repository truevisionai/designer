/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvScenarioInstance } from '../services/tv-scenario-instance';
import { GlobalAction } from './actions/osc-global-action';
import { UserDefinedAction } from './actions/osc-user-defined-action';
import { AbstractCondition } from './conditions/osc-condition';
import { ConditionGroup } from './conditions/osc-condition-group';
import { AbstractPrivateAction } from './osc-interfaces';
import { Story } from './osc-story';


export class EntityInitAction {

	constructor ( public name: string, public action: AbstractPrivateAction ) {

	}
}

export class Storyboard {

	public stories: Map<string, Story> = new Map<string, Story>();
	public endConditionGroups: ConditionGroup[] = [];
	public privateInitAction: EntityInitAction[] = [];
	private m_InitActions = new InitActions;

	get initActions () {

		return this.m_InitActions;

	}

	addStory ( story: Story ) {

		const hasName = TvScenarioInstance.db.has_story( story.name );

		if ( hasName ) throw new Error( `Story name '${ story.name }' has already been used` );

		this.stories.set( story.name, story );

		TvScenarioInstance.db.add_story( story.name, story );

	}

	addNewStory ( name: string, owner?: string ): Story {

		const story = new Story( name, owner );

		this.addStory( story );

		return story;

	}

	addEndConditionGroup ( group: ConditionGroup ) {

		this.endConditionGroups.push( group );

	}

	addEndCondition ( condition: AbstractCondition ) {

		if ( this.endConditionGroups.length > 0 ) {

			this.endConditionGroups[ 0 ].addCondition( ( condition ) );

		} else {

			const group = new ConditionGroup();

			group.addCondition( condition );

			this.addEndConditionGroup( group );

		}

	}


	addPrivateInitAction ( owner: string, action: AbstractPrivateAction ): any {

		this.privateInitAction.push( new EntityInitAction( owner, action ) );

	}

}


export class InitActions {

	private globalActions: GlobalAction[] = [];
	private userDefinedActions: UserDefinedAction[] = [];
	private privateActions: AbstractPrivateAction[] = [];

	addPrivateAction ( owner: string, action: AbstractPrivateAction ): any {

		this.privateActions.push( action );

	}

}
