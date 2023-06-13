import { AbsoluteTarget } from '../models/actions/osc-absolute-target';
import { LaneChangeAction } from '../models/actions/osc-lane-change-action';
import { PositionAction } from '../models/actions/osc-position-action';
import { LaneChangeDynamics, SpeedDynamics } from '../models/actions/osc-private-action';
import { RelativeTarget } from '../models/actions/osc-relative-target';
import { SpeedAction } from '../models/actions/osc-speed-action';
import { EntityObject } from '../models/osc-entities';
import { ActionType, DynamicsShape } from '../models/osc-enums';
import { WorldPosition } from '../models/positions/osc-world-position';

export class ActionFactory {

	public static createAction ( type: ActionType, entity?: EntityObject ) {

		switch ( type ) {

			case ActionType.Private_Position:
				return this.createPositionAction( entity );

			case ActionType.Private_Longitudinal_Speed:
				return this.createSpeedAction( entity );

			case ActionType.Private_Lateral:
				return this.createLaneChangeAction( entity );

			default:
				throw new Error( `Unsupported private action: ${ type }` );

		}

	}

	private static createPositionAction ( entity?: EntityObject ): PositionAction {

		const position = entity.gameObject?.position;

		return new PositionAction( new WorldPosition(
			position?.x,
			position?.y,
			position?.z
		) );

	}

	private static createSpeedAction ( entity?: EntityObject ) {

		return new SpeedAction(
			new SpeedDynamics( DynamicsShape.step ),
			new AbsoluteTarget( entity?.speed )
		);
	}

	private static createLaneChangeAction ( entity?: EntityObject ) {

		const target = entity ? new RelativeTarget( entity.name, 1 ) : new AbsoluteTarget( 1 );

		const dynamics = new LaneChangeDynamics( 5, 0, DynamicsShape.sinusoidal, 0 );

		return new LaneChangeAction( dynamics, target );
	}
}
