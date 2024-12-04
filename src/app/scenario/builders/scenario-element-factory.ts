/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

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
import { Injectable } from "@angular/core";
import { TvAction } from '../models/tv-action';

@Injectable( {
	providedIn: 'root'
} )
export class ScenarioElementFactory {

	private storyId = new IDService();

	private actId = new IDService();

	private maneuverGroupId = new IDService();

	private maneuverId = new IDService();

	private eventId = new IDService();

	private actionId = new IDService();

	constructor ( private actionFactory: ActionFactory ) {
	}

	reset (): void {

		this.storyId.reset();
		this.actId.reset();
		this.maneuverGroupId.reset();
		this.maneuverId.reset();
		this.eventId.reset();
		this.actionId.reset();

	}

	makeStory ( entity: ScenarioEntity, $actionType: ActionType ): Story {

		const story = this.createStory( entity );

		const action = this.actionFactory.createActionWithoutName( $actionType, entity );

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

	createStory ( entity: ScenarioEntity ): Story {

		const id = this.storyId.getNextId();

		const storyName = `Story${ id }`;

		return new Story( storyName, entity.name );
	}

	createAct (): Act {

		const id = this.actId.getNextId();

		return new Act( `Act${ id }` );

	}

	createManeuverGroup ( entity: ScenarioEntity ): ManeuverGroup {

		const id = this.maneuverGroupId.getNextId();

		const actors = [ entity.name ];

		return new ManeuverGroup( `ManeuverGroup${ id }`, 1, actors );

	}

	createManeuver (): Maneuver {

		const id = this.maneuverId.getNextId();

		const maneuver = new Maneuver( `Maneuver${ id }` );

		return maneuver;

	}

	createEvent ( action: PrivateAction ): TvEvent {

		const id = this.eventId.getNextId();

		const event = new TvEvent( `Event${ id }` );

		const actionID = this.actionId.getNextId();

		event.addNewAction( `Action${ actionID }`, action );

		const condition = ConditionFactory.createCondition( ConditionType.ByValue_SimulationTime );

		event.addStartCondition( condition );

		return event;
	}

	createEventAction ( $actionType: ActionType, entity: ScenarioEntity ): TvAction {

		const actionID = this.actionId.getNextId();

		const name = `Action${ actionID }`;

		return this.actionFactory.createNamedAction( name, $actionType, entity );

	}

	createEmptyEvent (): TvEvent {

		const id = this.eventId.getNextId();

		const event = new TvEvent( `Event${ id }` );

		const condition = ConditionFactory.createCondition( ConditionType.ByValue_SimulationTime );

		event.addStartCondition( condition );

		return event;
	}

}
