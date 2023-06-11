import { MathUtils } from 'three';
import { Time } from '../../../../core/time';
import { Maths } from '../../../../utils/maths';
import { TvMapInstance } from '../../../tv-map/services/tv-map-source-file';
import { OscSourceFile } from '../../services/osc-source-file';
import { OscEntityObject } from '../osc-entities';
import { OscActionType, OscDynamicsShape, OscTargetType } from '../osc-enums';
import { AbstractPrivateAction } from '../osc-interfaces';
import { AbstractTarget } from './abstract-target';
import { OscAbsoluteTarget } from './osc-absolute-target';
import { OscLaneChangeDynamics } from './osc-private-action';
import { OscRelativeTarget } from './osc-relative-target';

export class OscLaneChangeAction extends AbstractPrivateAction {

	public actionName = 'LaneChange';
	public actionType: OscActionType = OscActionType.Private_Lateral;

	// public dynamics: OscLaneChangeDynamics = new OscLaneChangeDynamics();
	// public target: AbstractTarget = new OscAbsoluteTarget( 0 );
	// public targetLaneOffset?: number = null;

	// variables for action help
	private startTime = 0;
	private currentLaneWidth = 0;
	private currentLaneId = 0;
	private newLaneWidth = 0;
	private newLaneId = 0;
	private tDirection = 0;
	private changeInTCoordinate = 0;

	constructor (
		public dynamics?: OscLaneChangeDynamics,
		public target?: AbstractTarget,
		public targetLaneOffset?: number
	) {

		super();

		this.dynamics = dynamics || new OscLaneChangeDynamics();
		this.target = target || new OscAbsoluteTarget( 0 );

	}

	execute ( entity: OscEntityObject ) {

		if ( this.isCompleted ) return;

		if ( !this.hasStarted ) {

			this.start( entity );

		} else {

			const timePassed = ( Time.time - this.startTime ) * 0.001;

			if ( timePassed <= this.dynamics.time ) {

				this.performLaneChange( entity, timePassed );

			} else {

				this.isCompleted = true;

				this.completed.emit();

				entity.laneOffset = 0;
				entity.laneId = this.newLaneId;
			}

		}

	}

	start ( entity: OscEntityObject ) {

		const openDrive = TvMapInstance.map;
		const road = openDrive.getRoadById( entity.roadId );

		this.startTime = Time.time;

		this.hasStarted = true;

		this.currentLaneId = entity.laneId;

		switch ( this.target.targetType ) {

			case OscTargetType.absolute:
				this.newLaneId = this.target.value;
				break;

			case OscTargetType.relative:
				const name = ( this.target as OscRelativeTarget ).object;
				const obj = OscSourceFile.openScenario.objects.get( name );
				const otherLaneId = obj.laneId;
				this.newLaneId = otherLaneId + this.target.value;
				break;

		}

		this.currentLaneWidth = road.getLaneWidth( entity.sCoordinate, this.currentLaneId );
		this.newLaneWidth = road.getLaneWidth( entity.sCoordinate, this.newLaneId );

		// if left lane change then negative
		// if right lane change then positive
		this.tDirection = this.newLaneId > this.currentLaneId ? -1 : 1;

		// change from center of this lane to center of new lane
		this.changeInTCoordinate = this.tDirection * ( this.currentLaneWidth + this.newLaneWidth ) * 0.5;

	}

	private performLaneChange ( entity: OscEntityObject, timePassed: number ) {

		switch ( this.dynamics.shape ) {

			case OscDynamicsShape.linear:
				this.linearLaneChange( entity, timePassed );
				break;

			case OscDynamicsShape.cubic:
				throw new Error( 'cubic dynamics is not currently supported' );
				break;

			case OscDynamicsShape.sinusoidal:
				throw new Error( 'sinusoidal dynamics is not currently supported' );
				break;

			case OscDynamicsShape.step:
				entity.laneId = this.newLaneId;
				break;

		}
	}

	private linearLaneChange ( entity: OscEntityObject, timePassed: number ) {

		const fraction = timePassed / this.dynamics.time;

		entity.laneOffset = MathUtils.lerp( 0, this.changeInTCoordinate, fraction );

		// console.log( entity.getLaneOffset(), this.changeInTCoordinate );

		// if ( laneOffset == this.changeInTCoordinate ) this.isCompleted = true;
	}

	private sinusoidalLaneChange ( entity: OscEntityObject, timePassed: number ) {

		const fraction = timePassed / this.dynamics.time;

		// TODO: Add sine interpolation
		entity.laneOffset = Maths.cosineInterpolation( 0, this.changeInTCoordinate, fraction );

		// console.log( entity.getLaneOffset(), this.changeInTCoordinate );
	}
}
