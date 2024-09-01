/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from "app/events/pointer-event-data";
import { BaseTool } from "../base-tool";
import { ToolType } from "../tool-types.enum";
import { PropSpanToolService } from "./prop-span-tool.service";
import { OnRoadMovingStrategy } from "app/core/strategies/move-strategies/on-road-moving.strategy";
import { RoadCoordStrategy } from "app/core/strategies/select-strategies/road-coord-strategy";
import { PropManager } from "app/managers/prop-manager";
import { TvRoadCoord } from "app/map/models/TvRoadCoord";
import { TvRoadObject } from "app/map/models/objects/tv-road-object";
import { TvRoad } from "app/map/models/tv-road.model";
import { DepSelectRoadStrategy } from "app/core/strategies/select-strategies/select-road-strategy";
import { DepPointStrategy } from "app/core/strategies/select-strategies/control-point-strategy";
import { AppInspector } from "app/core/inspector";
import { TvObjectRepeat } from "app/map/models/objects/tv-object-repeat";
import { RoadPosition } from "app/scenario/models/positions/tv-road-position";
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { PropSpanInspector } from "./prop-span-inspector";
import { DebugState } from "../../services/debug/debug-state";
import { Vector3 } from "three";
import { Commands } from "app/commands/commands";
import { RoadGeometryService } from "app/services/road/road-geometry.service";

export class PropSpanTool extends BaseTool<any> {

	name: string = 'Prop Span Tool';

	toolType: ToolType = ToolType.PropSpanTool;

	road: TvRoad;

	point: SimpleControlPoint<TvObjectRepeat>;

	pointMoved: boolean;

	get prop () {
		return PropManager.getAssetNode();
	}

	constructor ( private tool: PropSpanToolService ) {

		super();

	}

	init (): void {

		this.selectionService.registerStrategy( SimpleControlPoint.name, new DepPointStrategy() );

		const selectRoadStrategy = new DepSelectRoadStrategy( false, true );

		selectRoadStrategy.debugger = this.tool.toolDebugger;

		this.selectionService.registerStrategy( TvRoad.name, selectRoadStrategy );

		this.tool.base.addCreationStrategy( new RoadCoordStrategy() );

		this.tool.base.addMovingStrategy( new OnRoadMovingStrategy() );

		this.setHint( 'use LEFT CLICK to select a road/lane' );

		this.setDebugService( this.tool.toolDebugger );

	}

	enable (): void {

		super.enable();

	}

	disable (): void {

		super.disable();

		this.tool.base.reset();

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.selectionService.handleSelection( e );

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( !this.road ) {

			this.setHint( 'Select a road/lane' );

			return;
		}

		if ( !this.prop ) {

			this.setHint( 'Select a prop from project browser' );

			return;
		}

		this.tool.base.handleCreation( e, ( position ) => {

			if ( position instanceof TvRoadCoord ) {

				const roadSpanObject = this.tool.createRoadSpanObject( this.prop.guid, position );

				this.executeAddObject( roadSpanObject );

			}

		} );

	}

	onPointerMoved ( pointerEventData: PointerEventData ): void {

		this.highlight( pointerEventData );

		if ( !this.isPointerDown ) return;

		if ( !this.road ) return;

		if ( !this.point ) return;

		if ( !this.point.isSelected ) return;

		this.tool.base.handleMovement( pointerEventData, ( position ) => {

			if ( position instanceof RoadPosition ) {

				this.point.position.copy( position.position );

				this.pointMoved = true;

				this.tool.base.disableControls();

			}

		} );

	}

	onPointerUp ( e: PointerEventData ): void {

		this.tool.base.enableControls();

		if ( !this.point ) return;

		if ( !this.pointMoved ) return;

		const newCoord = this.tool.roadService.findRoadCoordAtPosition( e.point );
		const oldCoord = this.tool.roadService.findRoadCoordAtPosition( this.pointerDownAt );

		const newPosition = RoadGeometryService.instance.findCoordPosition( newCoord ).toVector3();
		const oldPosition = RoadGeometryService.instance.findCoordPosition( oldCoord ).toVector3();

		Commands.UpdatePosition( this.point, newPosition, oldPosition );

		this.pointMoved = false;

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.onRoadSelected( object );

		} else if ( object instanceof SimpleControlPoint ) {

			this.onPointSelected( object );

		}

	}

	onRoadSelected ( road: TvRoad ) {

		// if ( this.point ) this.onControlPointUnselected( this.point );

		// if ( this.road ) this.onRoadUnselected( this.road );

		this.road = road;

		this.debugService?.updateDebugState( road, DebugState.SELECTED );

		if ( !this.prop ) {

			this.setHint( 'Select a prop' );

		} else {

			this.setHint( 'use SHIFT + LEFT CLICK to create object' );

		}

	}

	onRoadUnselected ( road: TvRoad ) {

		this.debugService?.updateDebugState( road, DebugState.DEFAULT );

		this.road = null;

		this.setHint( 'use LEFT CLICK to select a road/lane' );

	}

	onPointUnselected ( point: SimpleControlPoint<TvObjectRepeat> ) {

		this.point = null;

		point.unselect();

		this.clearInspector();

	}

	onPointSelected ( point: SimpleControlPoint<TvObjectRepeat> ) {

		const roadObject = point.userData.roadObject;

		const repeat = point.userData.repeat;

		this.point = point;

		if ( !roadObject || !repeat ) return;

		AppInspector.setDynamicInspector( new PropSpanInspector( roadObject, repeat ) );

		point.select();

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.onRoadUnselected( object );

		} else if ( object instanceof SimpleControlPoint ) {

			this.onPointUnselected( object );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof PropSpanInspector ) {

			this.updateRoadSpanObject( object.roadObject, object.repeat );

		} else if ( object instanceof SimpleControlPoint ) {

			const roadObject = object.userData.roadObject;
			const repeat = object.userData.repeat;
			const road = object.userData.road;

			if ( !roadObject || !repeat || !road ) return;

			this.updateByPosition( roadObject, repeat, object.position );

		} else {

			super.onObjectUpdated( object );

		}

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvRoadObject ) {

			this.tool.addRoadSpanObject( object.road, object );

			this.debugService?.updateDebugState( object.road, DebugState.SELECTED );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvRoadObject ) {

			this.tool.removeRoadSpanObject( object.road, object );

			this.debugService?.updateDebugState( object.road, DebugState.SELECTED );

		}

	}

	updateRoadSpanObject ( roadObject: TvRoadObject, repeat: TvObjectRepeat, road?: TvRoad ) {

		this.tool.removeRoadSpanObject( roadObject.road, roadObject );

		this.tool.addRoadSpanObject( roadObject.road, roadObject );

		this.debugService?.updateDebugState( roadObject.road, DebugState.SELECTED );

	}

	updateByPosition ( roadObject: TvRoadObject, repeat: TvObjectRepeat, position: Vector3 ) {

		const coord = this.tool.roadService.findRoadCoordAtPosition( position );

		if ( !coord ) return;

		repeat.sStart = roadObject.s = coord.s;

		repeat.tStart = roadObject.t = coord.t;

		repeat.segmentLength = this.road.length - coord.s;

		this.updateRoadSpanObject( roadObject, repeat );

	}

}
