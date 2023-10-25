import { IDService } from 'app/factories/id.service';
import { ScenarioEntity } from '../models/entities/scenario-entity';
import { PrivateAction } from '../models/private-action';
import { Act } from '../models/tv-act';
import { ActionType, ConditionType } from '../models/tv-enums';
import { TvEvent } from '../models/tv-event';
import { Maneuver } from '../models/tv-maneuver';
import { ManeuverGroup } from '../models/tv-sequence';
import { Story } from '../models/tv-story';
import { ActionFactory } from './action-factory';
import { ConditionFactory } from './condition-factory';


export class ScenarioElementFactory {

	private static storyId = new IDService();
	private static actId = new IDService();
	private static maneuverGroupId = new IDService();
	private static maneuverId = new IDService();
	private static eventId = new IDService();
	private static actionId = new IDService();

	static reset () {

		this.storyId.reset();
		this.actId.reset();
		this.maneuverGroupId.reset();
		this.maneuverId.reset();
		this.eventId.reset();
		this.actionId.reset();

	}

	static makeStory ( entity: ScenarioEntity, $actionType: ActionType ) {

		const story = this.createStory( entity );

		const action = ActionFactory.createActionWithoutName( $actionType, entity );

		const act = this.createAct();

		const maneuverGroup = this.createManeuverGroup( entity );

		const maneuver = this.createManeuver();

		const event = this.createEvent( action );

		story.addAct( act );

		act.addManeuverGroup( maneuverGroup );

		maneuverGroup.addManeuver( maneuver );

		maneuver.addEvent( event );

		return story;
	}

	static createStory ( entity: ScenarioEntity ) {

		const id = this.storyId.getUniqueID();

		const storyName = `Story${ id }`;

		return new Story( storyName, entity.name );
	}

	static createAct () {

		const id = this.actId.getUniqueID();

		return new Act( `Act${ id }` );

	}

	static createManeuverGroup ( entity: ScenarioEntity ) {

		const id = this.maneuverGroupId.getUniqueID();

		const actors = [ entity.name ];

		return new ManeuverGroup( `ManeuverGroup${ id }`, 1, actors );

	}

	static createManeuver () {

		const id = this.maneuverId.getUniqueID();

		const maneuver = new Maneuver( `Maneuver${ id }` );

		return maneuver;

	}

	static createEvent ( action: PrivateAction ) {

		const id = this.eventId.getUniqueID();

		const event = new TvEvent( `Event${ id }` );

		const actionID = this.actionId.getUniqueID();

		event.addNewAction( `Action${ actionID }`, action );

		const condition = ConditionFactory.createCondition( ConditionType.ByValue_SimulationTime );

		event.addStartCondition( condition );

		return event;
	}

	static createEventAction ( $actionType: ActionType, entity: ScenarioEntity ) {

		const actionID = this.actionId.getUniqueID();

		const name = `Action${ actionID }`;

		return ActionFactory.createNamedAction( name, $actionType, entity );

	}

	static createEmptyEvent () {

		const id = this.eventId.getUniqueID();

		const event = new TvEvent( `Event${ id }` );

		const condition = ConditionFactory.createCondition( ConditionType.ByValue_SimulationTime );

		event.addStartCondition( condition );

		return event;
	}

}
