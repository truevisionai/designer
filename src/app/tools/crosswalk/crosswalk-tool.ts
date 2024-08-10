/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CommandHistory } from 'app/commands/command-history';
import { PointerEventData } from '../../events/pointer-event-data';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { ToolType } from '../tool-types.enum';
import { ControlPointStrategy } from '../../core/strategies/select-strategies/control-point-strategy';
import { RoadCoordStrategy } from '../../core/strategies/select-strategies/road-coord-strategy';
import { BaseTool } from '../base-tool';
import { TvRoad } from 'app/map/models/tv-road.model';
import { SelectRoadStrategy } from 'app/core/strategies/select-strategies/select-road-strategy';
import { AppInspector } from 'app/core/inspector';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { OnRoadMovingStrategy } from 'app/core/strategies/move-strategies/on-road-moving.strategy';
import { AddObjectCommand } from "../../commands/add-object-command";
import { SelectObjectCommand } from "../../commands/select-object-command";
import { TvRoadObject, TvRoadObjectType } from 'app/map/models/objects/tv-road-object';
import { TvObjectMarking } from 'app/map/models/tv-object-marking';
import { CrosswalkToolHelper } from "./crosswalk-tool.helper";
import { CrosswalkInspector } from './crosswalk.inspector';
import { TvCornerRoad } from 'app/map/models/objects/tv-corner-road';
import { DebugState } from "../../services/debug/debug-state";
import { CornerControlPoint } from './crosswalk-tool-debugger';
import { TvConsole } from 'app/core/utils/console';
import { Log } from "../../core/utils/log";
import { Commands } from 'app/commands/commands';

export class CrosswalkTool extends BaseTool<any> {

	name: string = 'CrosswalkTool';

	toolType = ToolType.Crosswalk;

	get selectedCrosswalk (): TvRoadObject {

		if ( this.selectedPoint?.roadObject?.attr_type == TvRoadObjectType.crosswalk ) {
			return this.selectedPoint.roadObject;
		}

		return this.selectionService.getLastSelected<TvRoadObject>( TvRoadObject.name );
	}

	get selectedPoint (): CornerControlPoint {
		return this.selectionService.getLastSelected<CornerControlPoint>( CornerControlPoint.name );
	}

	get selectedRoad (): TvRoad {
		return this.selectionService.getLastSelected<TvRoad>( TvRoad.name );
	}

	private pointMoved: boolean;

	constructor ( private tool: CrosswalkToolHelper ) {

		super();

	}

	init () {

		super.init();

		this.tool.base.reset();

		const selectRoadStrategy = new SelectRoadStrategy( false, true );

		selectRoadStrategy.debugger = this.tool.toolDebugger;

		this.selectionService.registerStrategy( CornerControlPoint.name, new ControlPointStrategy() );
		this.selectionService.registerStrategy( TvRoadObject.name, new ControlPointStrategy() );
		this.selectionService.registerStrategy( TvRoad.name, selectRoadStrategy );

		this.tool.base.addCreationStrategy( new RoadCoordStrategy() );
		this.tool.base.addMovingStrategy( new OnRoadMovingStrategy() );

		this.setDebugService( this.tool.toolDebugger );

		this.setHint( 'Use LEFT CLICK to select a road' );
	}

	enable () {

		super.enable();

	}

	disable (): void {

		super.disable();

		this.tool.base.reset();

		if ( this.selectedRoad ) this.onRoadUnselected( this.selectedRoad );

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( !this.selectedRoad ) return;

		const roadCoord = this.tool.roadService.findRoadCoord( e.point, false );

		if ( !roadCoord ) {
			this.setHint( 'Click on a non-junction road to create a crosswalk' );
			return;
		}

		if ( roadCoord.road.isJunction ) {
			this.setHint( 'Cannot create crosswalk on junction road' );
			return;
		}

		if ( !this.selectedCrosswalk ) {

			this.createCrosswalk( roadCoord );

		} else {

			this.createCornerRoad( this.selectedCrosswalk, roadCoord );

		}

	}

	onPointerDownSelect ( pointerEventData: PointerEventData ) {

		this.selectionService.handleSelection( pointerEventData );

	}

	onPointerMoved ( pointerEventData: PointerEventData ) {

		this.highlight( pointerEventData );

		if ( !this.isPointerDown ) return;

		if ( !this.selectedRoad ) return;

		if ( !this.selectedPoint ) return;

		if ( !this.selectedPoint.isSelected ) return;

		// this.tool.base.handleTargetMovement( pointerEventData, this.selectedRoad, position => {

		// 	this.selectedPoint.copyPosition( position.position );

		// } );

		const roadCoord = this.tool.roadService.findRoadCoord( pointerEventData.point, false );

		if ( !roadCoord ) {
			this.setHint( 'Click on a non-junction road to create a crosswalk' );
			return;
		}

		if ( roadCoord.road.isJunction ) {
			this.setHint( 'Cannot create crosswalk on junction road' );
			return;
		}

		if ( roadCoord.road != this.selectedRoad ) {
			this.setHint( 'Click on the selected road to move the crosswalk' );
			return;
		}

		this.selectedPoint.position.copy( roadCoord.position );

		this.pointMoved = true;
	}

	onPointerUp ( pointerEventData: PointerEventData ): void {

		if ( !this.selectedRoad ) return;

		if ( !this.selectedPoint ) return;

		if ( !this.selectedPoint.isSelected ) return;

		if ( !this.pointMoved ) return;

		const oldPosition = this.pointerDownAt.clone();

		const newPosition = this.selectedPoint.position.clone();

		if ( newPosition.distanceTo( this.pointerDownAt ) < 0.1 ) return;

		Commands.UpdatePosition( this.selectedPoint, newPosition, oldPosition );

		this.pointMoved = false;

	}

	onDeleteKeyDown (): void {

		if ( this.selectedPoint && this.selectedCrosswalk ) {

			this.executeRemoveObject( this.selectedPoint );

		} else if ( this.selectedCrosswalk && this.selectedRoad ) {

			this.executeRemoveObject( this.selectedCrosswalk );

		}

	}

	onObjectAdded ( object: any ): void {

		Log.info( 'CrosswalkTool.onObjectAdded', object.toString() );

		if ( object instanceof TvRoadObject ) {

			this.addCrosswalk( object.road || this.selectedRoad, object );

		} else if ( object instanceof CornerControlPoint ) {

			this.addCornerRoad( object.road, object.roadObject, object );

		} else if ( object instanceof CrosswalkInspector ) {

			this.addCrosswalk( object.roadObject.road, object.roadObject );

		}

	}

	onObjectUpdated ( object: any ): void {

		Log.info( 'CrosswalkTool.onObjectUpdated', object.toString() );

		if ( object instanceof TvRoadObject ) {

			this.updateCrosswalk( object.road, object );

		} else if ( object instanceof CornerControlPoint ) {

			this.updateCornerRoad( object );

		} else if ( object instanceof TvObjectMarking ) {

			if ( !this.selectedRoad ) return;

			const roadObject = this.tool.objectService.findRoadObjectByMarking( this.selectedRoad, object );

			const road = roadObject.road || this.selectedRoad;

			if ( !road ) {
				console.error( 'Failed to update crosswalk', object, roadObject );
				return;
			}

			this.tool.objectService.updateRoadObject( road, roadObject );

		} else if ( object instanceof CrosswalkInspector ) {

			this.updateCrosswalk( object.roadObject.road, object.roadObject );

		}

	}

	onObjectRemoved ( object: any ): void {

		Log.info( 'CrosswalkTool.onObjectRemoved', object.toString() );

		if ( object instanceof TvRoadObject ) {

			this.removeCrosswalk( object.road, object );

		} else if ( object instanceof CornerControlPoint ) {

			this.removeCornerRoad( object.roadObject, object );

		} else if ( object instanceof CrosswalkInspector ) {

			this.removeCrosswalk( object.roadObject.road, object.roadObject );

		}

	}

	onObjectSelected ( object: any ): void {

		Log.info( 'CrosswalkTool.onObjectSelected', object.toString() );

		if ( object instanceof TvRoad ) {

			this.onRoadSelected( object );

		} else if ( object instanceof TvRoadObject ) {

			this.onCrosswalkSelected( object );

		} else if ( object instanceof CornerControlPoint ) {

			this.onCornerRoadSelected( object );

		}

	}

	onObjectUnselected ( object: any ): void {

		Log.info( 'CrosswalkTool.onObjectUnselected', object.toString() );

		if ( object instanceof TvRoad ) {

			this.onRoadUnselected( object );

		} else if ( object instanceof TvRoadObject ) {

			this.onCrosswalkUnselected( object );

		} else if ( object instanceof CornerControlPoint ) {

			this.onCornerRoadUnselected( object );

		}

	}

	onRoadSelected ( road: TvRoad ): void {

		Log.info( 'CrosswalkTool.onRoadSelected', road.toString() );

		this.selectedPoint?.unselect();

		this.debugService.updateDebugState( road, DebugState.SELECTED );

		this.setHint( 'Use SHIFT + LEFT CLICK to create a crosswalk' );
	}

	onRoadUnselected ( road: TvRoad ): void {

		Log.info( 'CrosswalkTool.onRoadUnselected', road.toString() );

		this.debugService.updateDebugState( road, DebugState.DEFAULT );

		this.setHint( 'Use LEFT CLICK to select a road' );
	}

	onCrosswalkSelected ( roadObject: TvRoadObject ) {

		Log.info( 'CrosswalkTool.onCrosswalkSelected', roadObject.toString() );

		const marking = roadObject.markings[ 0 ];

		if ( !marking ) return;

		AppInspector.setInspector( DynamicInspectorComponent, new CrosswalkInspector( roadObject, marking ) );

		this.setHint( 'Use SHIFT + LEFT CLICK to add a point' );

	}

	onCrosswalkUnselected ( roadObject: TvRoadObject ) {

		Log.info( 'CrosswalkTool.onCrosswalkUnselected', roadObject.toString() );

		AppInspector.clear();

		this.setHint( 'Use SHIFT + LEFT CLICK to create a crosswalk' );

		this.debugService.updateDebugState( roadObject.road, DebugState.REMOVED );

	}

	onCornerRoadSelected ( point: CornerControlPoint ) {

		Log.info( 'CrosswalkTool.onCornerRoadSelected', point.toString() );

		const marking = this.tool.objectService.findMarkingByCornerRoad( point.roadObject, point.corner );

		this.selectedPoint?.unselect();

		point.select();

		this.setInspector( new CrosswalkInspector( point.roadObject, marking ) );

		this.setHint( 'Drag the point to move the crosswalk' );

	}

	onCornerRoadUnselected ( point: CornerControlPoint ) {

		Log.info( 'CrosswalkTool.onCornerRoadUnselected', point.toString() );

		AppInspector.clear();

		point.unselect();

	}

	createCornerRoad ( roadObject: TvRoadObject, roadCoord: TvRoadCoord ) {

		if ( roadCoord.roadId != roadObject.road.id ) return;

		const id = this.selectedCrosswalk.outlines[ 0 ].cornerRoad.length;

		const corner = new TvCornerRoad( id, roadCoord.road, roadCoord.s, roadCoord.t );

		const point = this.tool.toolDebugger.createNode( roadCoord.road, roadObject, corner );

		const addCommand = new AddObjectCommand( point );

		const selectCommand = new SelectObjectCommand( point, this.selectedPoint );

		CommandHistory.executeMany( addCommand, selectCommand );

	}

	createCrosswalk ( roadCoord: TvRoadCoord ) {

		const crosswalk = this.tool.objectFactory.createRoadObject( roadCoord, TvRoadObjectType.crosswalk );

		const addCommand = new AddObjectCommand( crosswalk );

		const selectCommand = new SelectObjectCommand( crosswalk );

		CommandHistory.executeMany( addCommand, selectCommand );

	}


	addCrosswalk ( road: TvRoad, object: TvRoadObject ) {

		this.tool.objectService.addRoadObject( road, object );

		this.debugService.updateDebugState( road, DebugState.SELECTED );

	}

	updateCrosswalk ( road: TvRoad, object: TvRoadObject ) {

		this.tool.objectService.updateRoadObject( road, object );

		this.debugService.updateDebugState( road, DebugState.SELECTED );

	}

	removeCrosswalk ( road: TvRoad, object: TvRoadObject ) {

		if ( !road ) {
			console.error( 'Failed to remove crosswalk', object, road );
			TvConsole.error( `Failed to remove crosswalk` );
			return;
		}

		this.tool.objectService.removeRoadObject( road, object );

		this.onCrosswalkUnselected( object );

		this.debugService.updateDebugState( road, DebugState.REMOVED );
	}

	addCornerRoad ( road: TvRoad, roadObject: TvRoadObject, point: CornerControlPoint ) {

		this.tool.objectService.addCornerRoad( roadObject, point.mainObject );

		this.debugService.updateDebugState( road, DebugState.SELECTED );

	}

	removeCornerRoad ( roadObject: TvRoadObject, point: CornerControlPoint ) {

		this.tool.objectService.removeCornerRoad( roadObject, point.object );

		this.debugService.updateDebugState( roadObject.road, DebugState.SELECTED );

	}

	updateCornerRoad ( controlPoint: CornerControlPoint ) {

		const roadObject = controlPoint.roadObject;

		const coord = controlPoint.road.getPosThetaByPosition( controlPoint.position );

		if ( !coord ) {
			return;
		}

		controlPoint.corner.s = coord.s;

		controlPoint.corner.t = coord.t;

		this.updateCrosswalk( roadObject.road, roadObject );

	}


}
