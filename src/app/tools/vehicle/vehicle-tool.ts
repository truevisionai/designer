/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IToolWithPoint, SelectPointCommand } from 'app/commands/select-point-command';
import { SetInspectorCommand } from 'app/commands/set-inspector-command';
import { DepPointStrategy } from 'app/core/strategies/select-strategies/control-point-strategy';
import { RoadCoordStrategy } from 'app/core/strategies/select-strategies/road-coord-strategy';
import { BaseSelectionStrategy } from 'app/core/strategies/select-strategies/select-strategy';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { EntityInspector } from 'app/scenario/inspectors/tv-entity-inspector/tv-entity-inspector.component';
import { TeleportAction } from 'app/scenario/models/actions/tv-teleport-action';
import { ScenarioEntity } from 'app/scenario/models/entities/scenario-entity';
import { DynamicControlPoint } from 'app/objects/dynamic-control-point';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { CommandHistory } from 'app/commands/command-history';
import { VehicleEntity } from '../../scenario/models/entities/vehicle-entity';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { EntityService } from "../../scenario/entity/entity.service";
import { PickingHelper } from "../../services/picking-helper.service";
import { Commands } from 'app/commands/commands';

export class VehicleTool extends BaseTool<any> implements IToolWithPoint {

	public name: string = 'VehicleTool';

	public toolType = ToolType.Vehicle;

	private movingStrategy: BaseSelectionStrategy<TvRoadCoord>;

	private controlPointStrategy: BaseSelectionStrategy<DynamicControlPoint<ScenarioEntity>>;

	private points: DynamicControlPoint<ScenarioEntity>[] = [];

	private point: DynamicControlPoint<ScenarioEntity>;

	constructor ( private entityService: EntityService ) {

		super();

		this.movingStrategy = new RoadCoordStrategy();
		this.controlPointStrategy = new DepPointStrategy<DynamicControlPoint<ScenarioEntity>>();
	}

	setPoint ( value: DynamicControlPoint<ScenarioEntity> ): void {

		this.point = value;

	}

	getPoint (): DynamicControlPoint<ScenarioEntity> {

		return this.point;

	}

	enable (): void {

		this.entityService.entities.forEach( ( entity ) => {

			this.createControlPoint( entity );

		} );

	}

	createControlPoint ( entity: ScenarioEntity ): DynamicControlPoint<ScenarioEntity> {

		const controlPoint = new DynamicControlPoint( entity );

		// entity.add( controlPoint );

		this.points.push( controlPoint );

		return controlPoint;

	}

	disable (): void {

		super.disable();

		this.points.forEach( ( point ) => {

			point.parent?.remove( point );

		} );

		this.points = [];

	}

	onPointerDownCreate ( event: PointerEventData ): void {

		const roadCoord = this.movingStrategy.onPointerDown( event );

		if ( !roadCoord ) this.setHint( 'Click on road geometry to create vehicle' );

		if ( !roadCoord ) return;

		const vehicleEntity = this.entityService.createVehicleAt( roadCoord.position, roadCoord.orientation );

		// const point = this.createControlPoint( vehicleEntity );

		Commands.AddObject( vehicleEntity );

	}

	onPointerDownSelect ( event: PointerEventData ): void {

		// if ( this.isVehicleSelected( event ) ) return;
		// deselect
		// CommandHistory.execute( new SetInspectorCommand( null, null ) );

		const point = this.controlPointStrategy.onPointerDown( event );

		if ( point ) {

			if ( point == this.point ) return;

			CommandHistory.execute( new SelectPointCommand( this, point, EntityInspector, point.mainObject ) );

			return;

		}

		if ( !this.point ) return;

		CommandHistory.executeMany(
			new SetInspectorCommand( null, null ),
			new SelectPointCommand( this, null, null, null )
		);

	}

	onPointerMoved ( pointerEventData: PointerEventData ): void {

		if ( pointerEventData.button !== MouseButton.LEFT ) return;

		this.controlPointStrategy.onPointerMoved( pointerEventData );

		if ( !this.point?.isSelected ) return;

		if ( !this.pointerDownAt ) return;

		const roadCoord = this.movingStrategy.onPointerDown( pointerEventData );

		if ( !roadCoord ) return;

		this.updateLocation( this.point.mainObject, roadCoord );

	}

	updateLocation ( entity: ScenarioEntity, roadCoord: TvRoadCoord ): void {

		const teleportAction = entity.initActions.find( action => action instanceof TeleportAction ) as TeleportAction;

		teleportAction?.position?.updateFromWorldPosition( roadCoord.position, roadCoord.orientation );

	}

	onPointerUp ( pointerEventData: PointerEventData ): void {

		if ( pointerEventData.button !== MouseButton.LEFT ) return;

		if ( !this.point?.isSelected ) return;

		if ( !this.pointerDownAt ) return;

		const position = pointerEventData.point;

		if ( position.distanceTo( this.pointerDownAt ) < 0.5 ) return;

		// TODO: fix this
		// CommandHistory.execute( new UpdatePositionCommand( this.point.mainObject, position, this.pointerDownAt ) );

	}

	isVehicleSelected ( event: PointerEventData ): boolean {

		const vehicles = this.entityService.entities.map( entity => entity.mesh );

		const vehicle = PickingHelper.findNearestViaDistance( event.point, vehicles, 2 );

		if ( !vehicle || !vehicle.userData.entity ) return false;

		this.selectVehicle( vehicle.userData.entity );

		return true;

	}

	selectVehicle ( entity: VehicleEntity ): void {

		CommandHistory.execute( new SetInspectorCommand( EntityInspector, entity ) );

	}

}
