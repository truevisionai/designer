/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/core/commands/base-command';
import { SetInspectorCommand } from 'app/core/commands/set-inspector-command';
import { SceneService } from 'app/core/services/scene.service';
import { EntityInspector } from 'app/modules/scenario/inspectors/tv-entity-inspector/tv-entity-inspector.component';
import { SimulationTimeCondition } from 'app/modules/scenario/models/conditions/tv-simulation-time-condition';
import { ActionType, Rule } from 'app/modules/scenario/models/tv-enums';
import { ScenarioInstance } from 'app/modules/scenario/services/scenario-instance';
import { MathUtils, Vector3 } from 'three';
import { ActionFactory } from '../../../modules/scenario/builders/action-factory';
import { VehicleEntity } from '../../../modules/scenario/models/entities/vehicle-entity';


export class AddVehicleCommand extends BaseCommand {

	private setInspector: SetInspectorCommand;

	constructor ( public entity: VehicleEntity, position: Vector3 ) {

		super();

		entity.position.copy( position.clone() );

		entity.name = `Vehicle${ ScenarioInstance.scenario.objects.size + 1 }`;

		const positionAction = ActionFactory.createActionWithoutName( ActionType.Private_Position, entity );
		const speedAction = ActionFactory.createActionWithoutName( ActionType.Private_Longitudinal_Speed, entity );

		entity.addInitAction( positionAction );
		entity.addInitAction( speedAction );

		this.addStoryActions();

		this.setInspector = new SetInspectorCommand( EntityInspector, entity );
	}

	execute (): void {

		SceneService.add( this.entity );

		ScenarioInstance.scenario.addObject( this.entity );

		this.setInspector.execute();

	}

	undo (): void {

		SceneService.remove( this.entity );

		ScenarioInstance.scenario.removeObject( this.entity );

		this.setInspector.undo();

	}

	redo (): void {

		this.execute();

	}

	private addStoryActions () {

		const story = this.scenario.createStory( this.entity );

		this.scenario.storyboard.addEndCondition( new SimulationTimeCondition( 10, Rule.GreaterThan ) );

		const act = story.addNewAct( `Story-${ MathUtils.randInt( 1, 100 ) }` );

		const sequence = act.addNewSequence( `Sequence-${ MathUtils.randInt( 1, 100 ) }` + act.name, 1, this.entity.name );

		act.addStartCondition( new SimulationTimeCondition( 2, Rule.GreaterThan ) );

		const maneuver = sequence.addNewManeuver( `Maneuver-${ MathUtils.randInt( 1, 100 ) }` );

		// const event = maneuver.addNewEvent( 'MyLaneChangeLeftEvent', 'overwrite' );

		// event.addNewAction( 'MyLaneChangeLeftAction', new LaneChangeAction(
		// 	new LaneChangeDynamics( 5, null, DynamicsShape.linear ),
		// 	new AbsoluteTarget( -3 ),
		// ) );

		// event.addNewAction( 'MyLaneChangeLeftAction', new LaneChangeAction(
		// 	new LaneChangeDynamics( 5, null, DynamicsShape.cubic ),
		// 	new RelativeTarget( this.entity.name, 1 ),
		// ) );


		// event.addStartCondition( new SimulationTimeCondition( 2, Rule.greater_than ) );

	}
}
