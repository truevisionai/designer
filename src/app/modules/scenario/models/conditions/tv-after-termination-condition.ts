/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { StoryEvent } from '../../services/scenario-director.service';
import { ScenarioEvents } from '../../services/scenario-events';
import { AfterTerminationRule, ConditionType, StoryElementState, StoryElementType } from '../tv-enums';
import { StateCondition } from './state-condition';

export class AfterTerminationCondition extends StateCondition {

	public name: string = 'AfterTerminationCondition';

	public readonly conditionType = ConditionType.ByState_AfterTermination;

	constructor (
		public elementName: string,
		public type: StoryElementType,
		public rule: AfterTerminationRule
	) {

		super();

		ScenarioEvents.events.subscribe( ( event: StoryEvent ) => this.eventCallback( event ) );

	}

	eventCallback ( event: StoryEvent ): void {

		if ( event.type !== this.type ) return;

		if ( event.name !== this.elementName ) return;

		if ( this.rule === AfterTerminationRule.any ) {

			this.passed = true;

		} else if ( this.rule === AfterTerminationRule.end && event.state === StoryElementState.completed ) {

			this.passed = true;

		} else if ( this.rule === AfterTerminationRule.cancel && event.state === StoryElementState.canceled ) {

			this.passed = true;

		}
	}

	hasPassed (): boolean {

		return this.passed;

	}

}
