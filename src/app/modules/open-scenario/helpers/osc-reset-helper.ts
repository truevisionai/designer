/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionGroup } from '../models/conditions/osc-condition-group';
import { Act } from '../models/osc-act';
import { Event } from '../models/osc-event';
import { AbstractAction } from '../models/osc-interfaces';
import { Maneuver } from '../models/osc-maneuver';
import { OpenScenario } from '../models/osc-scenario';
import { Story } from '../models/osc-story';

export class ResetHelper {

	constructor ( private openScenario: OpenScenario ) {

	}

	reset () {

		this.openScenario.objects.forEach( entity => {

			entity.enable();

			entity.initActions.forEach( action => {

				this.resetAction( action );

			} );

			entity.distanceTravelled = 0;

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

		act.sequences.forEach( sequence => {

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

	private resetEvent ( event: Event ) {

		event.hasStarted = false;
		event.isCompleted = false;

		this.resetGroups( event.startConditionGroups );

		event.getActions().forEach( action => {

			this.resetAction( action );

		} );
	}

	private resetAction ( action: AbstractAction ) {

		action.hasStarted = false;
		action.isCompleted = false;

		action.reset();

	}
}
