/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvConsole } from '../../../core/utils/console';
import { StoryboardEvent } from '../../services/scenario-director.service';
import { ScenarioEvents } from '../../services/scenario-events';
import { AfterTerminationRule, ConditionType, StoryboardElementState, StoryboardElementType } from '../tv-enums';
import { StateCondition } from './state-condition';
import { ValueCondition } from './value-condition';

export class StoryboardElementStateCondition extends ValueCondition {

	public conditionType: ConditionType = ConditionType.StoryboardElementState;
	public label: string = 'StoryboardElementStateCondition';

	constructor (
		public storyboardElementType: StoryboardElementType,
		public storyboardElementRef: string,
		public state: StoryboardElementState
	) {
		super();
		ScenarioEvents.events.subscribe( ( event: StoryboardEvent ) => this.eventCallback( event ) );
	}

	get stateAsString () {
		return StoryboardElementStateCondition.stateToString( this.state );
	}

	static stateToString ( state: StoryboardElementState ): string {

		switch ( state ) {

			case StoryboardElementState.startTransition:
				return 'startTransition';

			case StoryboardElementState.endTransition:
				return 'endTransition';

			case StoryboardElementState.stopTransition:
				return 'stopTransition';

			case StoryboardElementState.runningState:
				return 'runningState';

			case StoryboardElementState.skipTransition:
				return 'skipTransition';

			case StoryboardElementState.completeState:
				return 'completeState';

			case StoryboardElementState.standByState:
				return 'standByState';

			default:
				return 'startTransition';

		}

	}

	static stringToState ( state: string ): StoryboardElementState {

		switch ( state ) {

			case 'startTransition':
				return StoryboardElementState.startTransition;

			case 'endTransition':
				return StoryboardElementState.endTransition;

			case 'stopTransition':
				return StoryboardElementState.stopTransition;

			case 'runningState':
				return StoryboardElementState.runningState;

			case 'skipTransition':
				return StoryboardElementState.skipTransition;

			case 'completeState':
				return StoryboardElementState.completeState;

			case 'standByState':
				return StoryboardElementState.standByState;

			default:
				return StoryboardElementState.startTransition;
		}

	}

	static stringToStoryboardType ( type: string ): StoryboardElementType {

		switch ( type ) {

			case 'story':
				return StoryboardElementType.story;

			case 'maneuverGroup':
				return StoryboardElementType.maneuverGroup;

			case 'act':
				return StoryboardElementType.act;

			case 'maneuver':
				return StoryboardElementType.maneuver;

			case 'action':
				return StoryboardElementType.action;

			case 'event':
				return StoryboardElementType.event;

			default:
				TvConsole.error( 'StoryboardElementStateCondition ' + 's tringToStoryboardType' + 'Invalid type: ' + type );

		}

	}

	hasPassed (): boolean {
		return false;
	}

	private eventCallback ( event: StoryboardEvent ): void {

		if ( event.type !== this.storyboardElementType ) return;

		if ( event.name !== this.storyboardElementRef ) return;

		if ( event.state === this.state ) {

			this.passed = true;

		}

	}
}

export class AfterTerminationCondition extends StateCondition {

	public label: string = 'AfterTerminationCondition';

	public readonly conditionType = ConditionType.ByState_AfterTermination;

	constructor (
		public elementName: string,
		public type: StoryboardElementType,
		public rule: AfterTerminationRule
	) {

		super();

		ScenarioEvents.events.subscribe( ( event: StoryboardEvent ) => this.eventCallback( event ) );

	}

	eventCallback ( event: StoryboardEvent ): void {

		if ( event.type !== this.type ) return;

		if ( event.name !== this.elementName ) return;

		if ( this.rule === AfterTerminationRule.any ) {

			this.passed = true;

		} else if ( this.rule === AfterTerminationRule.end && event.state === StoryboardElementState.endTransition ) {

			this.passed = true;

		} else if ( this.rule === AfterTerminationRule.cancel && event.state === StoryboardElementState.stopTransition ) {

			this.passed = true;

		}
	}

	hasPassed (): boolean {

		return this.passed;

	}

}
