/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionGroup } from '../models/conditions/tv-condition-group';
import { Act } from '../models/tv-act';
import { TvEvent } from '../models/tv-event';
import { Maneuver } from '../models/tv-maneuver';
import { TvScenario } from '../models/tv-scenario';
import { Story } from '../models/tv-story';

export class ResetHelper {

	constructor ( private scenario: TvScenario ) {

	}

	reset (): void {

		this.scenario.objects.forEach( entity => {

			entity.enable();

			entity.initActions.forEach( action => action.reset() );

			entity.reset();

		} );

		this.scenario.storyboard.stories.forEach( story => {

			this.resetStory( story );

		} );

		this.scenario.storyboard.endConditionGroups.forEach( group => {

			group.reset();

		} );

	}

	private resetGroups ( groups: ConditionGroup[] ): void {

		groups.forEach( group => {

			group.reset();

		} );

	}

	private resetStory ( story: Story ): void {

		story.hasStarted = false;
		story.isCompleted = false;

		story.acts.forEach( act => {

			this.resetAct( act );

		} );

	}

	private resetAct ( act: Act ): void {

		act.hasStarted = false;
		act.isCompleted = false;

		this.resetGroups( act.startConditionGroups );
		this.resetGroups( act.endConditionGroups );
		this.resetGroups( act.cancelConditionGroups );

		act.maneueverGroups.forEach( sequence => {

			sequence.maneuvers.forEach( maneuver => {

				this.resetManeuver( maneuver );

			} );

		} );

	}

	private resetManeuver ( maneuver: Maneuver ): void {

		maneuver.hasStarted = false;
		maneuver.isCompleted = false;
		maneuver.eventIndex = 0;

		maneuver.events.forEach( event => {

			this.resetEvent( event );

		} );

	}

	private resetEvent ( event: TvEvent ): void {

		event.hasStarted = false;
		event.isCompleted = false;

		this.resetGroups( event.startConditionGroups );

		event.getActions().forEach( action => action.reset() );
	}
}
