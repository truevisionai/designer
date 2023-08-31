/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IToolWithPoint, SelectPointCommand } from 'app/core/commands/select-point-command';
import { SetInspectorCommand } from 'app/core/commands/set-inspector-command';
import { VehicleFactory } from 'app/core/factories/vehicle.factory';
import { PickingHelper } from 'app/core/services/picking-helper.service';
import { ControlPointStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
import { OnRoadStrategy } from 'app/core/snapping/select-strategies/on-road-strategy';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { EntityInspector } from 'app/modules/scenario/inspectors/tv-entity-inspector/tv-entity-inspector.component';
import { TeleportAction } from 'app/modules/scenario/models/actions/tv-teleport-action';
import { ScenarioEntity } from 'app/modules/scenario/models/entities/scenario-entity';
import { UpdatePositionCommand } from 'app/modules/three-js/commands/copy-position-command';
import { DynamicControlPoint } from 'app/modules/three-js/objects/dynamic-control-point';
import { TvRoadCoord } from 'app/modules/tv-map/models/tv-lane-coord';
import { CommandHistory } from 'app/services/command-history';
import { EntityManager } from 'app/services/entity-manager';
import { SnackBar } from 'app/services/snack-bar.service';
import { VehicleEntity } from '../../../modules/scenario/models/entities/vehicle-entity';
import { KeyboardInput } from '../../input';
import { ToolType } from '../../models/tool-types.enum';
import { BaseTool } from '../base-tool';
import { AddVehicleCommand } from './add-vehicle-command';

export class VehicleTool extends BaseTool implements IToolWithPoint {

	public name: string = 'VehicleTool';
	public toolType = ToolType.Vehicle;


	private movingStrategy: SelectStrategy<TvRoadCoord>;
	private controlPointStrategy: SelectStrategy<DynamicControlPoint<ScenarioEntity>>;

	private points: DynamicControlPoint<ScenarioEntity>[] = [];
	private point: DynamicControlPoint<ScenarioEntity>;

	constructor () {

		super();

		this.movingStrategy = new OnRoadStrategy();
		this.controlPointStrategy = new ControlPointStrategy<DynamicControlPoint<ScenarioEntity>>();
	}

	private get selectedVehicle (): VehicleEntity {

		return EntityManager.getEntity<VehicleEntity>();

	}

	setPoint ( value: DynamicControlPoint<ScenarioEntity> ): void {

		this.point = value;

	}

	getPoint (): DynamicControlPoint<ScenarioEntity> {

		return this.point;

	}

	enable (): void {

		this.scenario.objects.forEach( ( entity ) => {

			this.createControlPoint( entity );

		} );

	}

	createControlPoint ( entity: ScenarioEntity ): DynamicControlPoint<ScenarioEntity> {

		const controlPoint = new DynamicControlPoint( entity );

		entity.add( controlPoint );

		this.points.push( controlPoint );

		return controlPoint;

	}

	disable (): void {

		super.disable();

		this.points.forEach( ( point ) => {

			point.parent.remove( point );

		} );

		this.points = [];

	}

	onPointerDown ( event: PointerEventData ): void {

		if ( event.button != MouseButton.LEFT ) return;

		if ( KeyboardInput.isShiftKeyDown ) {

			this.handleCreation( event );

		} else {

			this.handleSelection( event );

		}

	}

	handleCreation ( event: PointerEventData ) {

		const roadCoord = this.movingStrategy.onPointerDown( event );

		if ( this.selectedVehicle ) {

			if ( !roadCoord ) this.setHint( 'Click on road geometry to create vehicle' );
			if ( !roadCoord ) return;

			const vehicleEntity = VehicleFactory.createVehicleAt( roadCoord.position, roadCoord.orientation );

			const point = this.createControlPoint( vehicleEntity );

			CommandHistory.execute( new AddVehicleCommand( this, vehicleEntity, point ) );


		} else {

			SnackBar.warn( 'Please select a vehicle from project browser' );

		}
	}

	handleSelection ( event: PointerEventData ) {

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


	updateLocation ( entity: ScenarioEntity, roadCoord: TvRoadCoord ) {

		const teleportAction = entity.initActions.find( action => action instanceof TeleportAction ) as TeleportAction;

		teleportAction?.position?.updateFromWorldPosition( roadCoord.position, roadCoord.orientation );

	}

	onPointerUp ( pointerEventData: PointerEventData ): void {

		if ( pointerEventData.button !== MouseButton.LEFT ) return;

		if ( !this.point?.isSelected ) return;

		if ( !this.pointerDownAt ) return;

		const position = pointerEventData.point;

		if ( position.distanceTo( this.pointerDownAt ) < 0.5 ) return;

		CommandHistory.execute( new UpdatePositionCommand( this.point.mainObject, position, this.pointerDownAt ) );

	}


	isVehicleSelected ( event: PointerEventData ): boolean {

		const vehicles = [ ...this.scenario.objects.values() ].map( ( object ) => object );

		const vehicle = PickingHelper.findNearestViaDistance( event.point, vehicles, 2 );

		if ( !vehicle || !vehicle.userData.entity ) return false;

		this.selectVehicle( vehicle.userData.entity );

		return true;
	}

	selectVehicle ( entity: VehicleEntity ) {

		CommandHistory.execute( new SetInspectorCommand( EntityInspector, entity ) );

	}

}
