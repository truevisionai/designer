/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvScenarioInstance } from '../services/tv-scenario-instance';
import { OscGlobalAction } from './actions/osc-global-action';
import { OscUserDefinedAction } from './actions/osc-user-defined-action';
import { AbstractCondition } from './conditions/osc-condition';
import { OscConditionGroup } from './conditions/osc-condition-group';
import { AbstractPrivateAction } from './osc-interfaces';
import { OscStory } from './osc-story';


export class EntityInitAction {

	constructor ( public name: string, public action: AbstractPrivateAction ) {

	}
}

export class OscStoryboard {

	public stories: Map<string, OscStory> = new Map<string, OscStory>();
	public endConditionGroups: OscConditionGroup[] = [];
	public privateInitAction: EntityInitAction[] = [];
	private m_InitActions = new OscInitActions;

	get initActions () {

		return this.m_InitActions;

	}

	addStory ( story: OscStory ) {

		const hasName = TvScenarioInstance.db.has_story( story.name );

		if ( hasName ) throw new Error( `Story name '${ story.name }' has already been used` );

		this.stories.set( story.name, story );

		TvScenarioInstance.db.add_story( story.name, story );

	}

	addNewStory ( name: string, owner?: string ): OscStory {

		const story = new OscStory( name, owner );

		this.addStory( story );

		return story;

	}

	addEndConditionGroup ( group: OscConditionGroup ) {

		this.endConditionGroups.push( group );

	}

	addEndCondition ( condition: AbstractCondition ) {

		if ( this.endConditionGroups.length > 0 ) {

			this.endConditionGroups[ 0 ].addCondition( ( condition ) );

		} else {

			const group = new OscConditionGroup();

			group.addCondition( condition );

			this.addEndConditionGroup( group );

		}

	}


	addPrivateInitAction ( owner: string, action: AbstractPrivateAction ): any {

		this.privateInitAction.push( new EntityInitAction( owner, action ) );

	}

}


export class OscInitActions {

	private globalActions: OscGlobalAction[] = [];
	private userDefinedActions: OscUserDefinedAction[] = [];
	private privateActions: AbstractPrivateAction[] = [];

	addPrivateAction ( owner: string, action: AbstractPrivateAction ): any {

		this.privateActions.push( action );

	}

}
