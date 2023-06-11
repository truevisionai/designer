import { OpenScenario } from '../models/osc-scenario';
import { OscConditionGroup } from '../models/conditions/osc-condition-group';
import { OscStory } from '../models/osc-story';
import { OscAct } from '../models/osc-act';
import { OscManeuver } from '../models/osc-maneuver';
import { OscEvent } from '../models/osc-event';
import { AbstractAction } from '../models/osc-interfaces';

export class OscResetHelper {

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

    }

    private resetGroups ( groups: OscConditionGroup[] ) {

        groups.forEach( group => {

            this.resetGroup( group );

        } );

    }

    private resetGroup ( group: OscConditionGroup ) {

        group.conditions.forEach( condition => {

            condition.passed = false;

        } );

    }

    private resetStory ( story: OscStory ) {

        story.hasStarted = false;
        story.isCompleted = false;

        story.acts.forEach( act => {

            this.resetAct( act );

        } );
    }

    private resetAct ( act: OscAct ) {

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

    private resetManeuver ( maneuver: OscManeuver ) {

        maneuver.hasStarted = false;
        maneuver.isCompleted = false;
        maneuver.eventIndex = 0;

        maneuver.events.forEach( event => {

            this.resetEvent( event );

        } );

    }

    private resetEvent ( event: OscEvent ) {

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
