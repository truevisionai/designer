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

	constructor ( private openScenario: TvScenario ) {

	}

	reset () {

		this.openScenario.objects.forEach( entity => {

			entity.enable();

			entity.initActions.forEach( action => action.reset() );

			entity.reset();

		} );

		this.openScenario.storyboard.stories.forEach( story => {

			this.resetStory( story );

		} );

		this.openScenario.storyboard.endConditionGroups.forEach( group => {

			group.reset();

		} );

	}

	private resetGroups ( groups: ConditionGroup[] ) {

		groups.forEach( group => {

			group.reset();

		} );

	}

	private resetStory ( story: Story ) {

		story.hasStarted = false;
		story.isCompleted = false;

		story.acts.forEach( act => {

			this.resetAct( act );

		} );

	}

	private resetAct ( act: Act ) {

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

	private resetManeuver ( maneuver: Maneuver ) {

		maneuver.hasStarted = false;
		maneuver.isCompleted = false;
		maneuver.eventIndex = 0;

		maneuver.events.forEach( event => {

			this.resetEvent( event );

		} );

	}

	private resetEvent ( event: TvEvent ) {

		event.hasStarted = false;
		event.isCompleted = false;

		this.resetGroups( event.startConditionGroups );

		event.getActions().forEach( action => action.reset() );
	}
}
