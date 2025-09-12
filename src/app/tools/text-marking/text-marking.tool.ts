/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from "app/events/pointer-event-data";
import { BaseTool } from "../base-tool";
import { ToolType } from "../tool-types.enum";
import { TextMarkingToolService } from "./text-marking-tool.service";
import { TvRoadSignal } from "app/map/road-signal/tv-road-signal.model";
import { AppInspector } from "app/core/inspector";
import { DepPointStrategy } from "app/core/strategies/select-strategies/control-point-strategy";
import { TextMarkingInspector } from "./text-marking.inspector";
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { DepSelectRoadStrategy } from "app/core/strategies/select-strategies/select-road-strategy";
import { TvRoad } from "app/map/models/tv-road.model";
import { DebugState } from "app/services/debug/debug-state";
import { DepLaneCoordStrategy } from "app/core/strategies/select-strategies/on-lane-strategy";
import { AnyLaneMovingStrategy } from "app/core/strategies/move-strategies/any-lane.moving.strategy";
import { NewLanePosition } from "app/scenario/models/positions/tv-lane-position";
import { Commands } from "app/commands/commands";
import { RoadDistance } from "app/map/road/road-distance";
import { MapEvents } from "../../events/map-events";
import { RoadSignalAddedEvent, RoadSignalRemovedEvent, RoadSignalUpdatedEvent } from "../../events/road-object.events";

export class TextMarkingTool extends BaseTool<TvRoadSignal> {

	name: string = 'TextMarkingTool';

	toolType: ToolType = ToolType.TextMarkingTool;

	constructor (
		private tool: TextMarkingToolService
	) {
		super();
	}

	init (): void {

		super.init();

		this.setHint( 'Text Marking Tool is used for marking text on the road' );

		const selectRoadStrategy = new DepSelectRoadStrategy( false, true );

		selectRoadStrategy.debugger = this.tool.toolDebugger;

		// this.tool.base.addCreationStrategy( new RoadCoordStrategy() );
		this.tool.base.addCreationStrategy( new DepLaneCoordStrategy() );

		this.selectionService.registerStrategy( SimpleControlPoint, new DepPointStrategy() );
		this.selectionService.registerStrategy( TvRoad, selectRoadStrategy );

		this.tool.base.addSelectionStrategy( new DepPointStrategy() );
		this.tool.base.addSelectionStrategy( selectRoadStrategy );

		// this.tool.base.addMovingStrategy( new OnRoadMovingStrategy() );
		this.tool.base.addMovingStrategy( new AnyLaneMovingStrategy() );

	}

	enable (): void {

		super.enable();

	}

	disable (): void {

		super.disable();

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( !e.point ) return;

		const laneCoord = this.tool.roadService.findLaneCoord( e.point );

		if ( !laneCoord ) return;

		const roadDistance = laneCoord.laneSection.s + laneCoord.laneDistance;

		const posTheta = laneCoord.road.getLaneCenterPosition( laneCoord.lane, roadDistance as RoadDistance );

		const signal = this.tool.createTextRoadMarking( posTheta.toRoadCoord( laneCoord.road ), 'STOP' );

		this.executeAddObject( signal );

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.selectionService.handleSelection( e );

	}

	onPointerUp ( e: PointerEventData ): void {

		if ( !this.currentSelectedPoint ) return;

		if ( !this.currentSelectedPointMoved ) return;

		if ( !this.pointerDownAt ) return;

		Commands.SetPosition( this.currentSelectedPoint, this.currentSelectedPoint.position, this.pointerDownAt );

		this.currentSelectedPointMoved = false;

	}

	onPointerMoved ( pointerEventData: PointerEventData ): void {

		this.tool.base.highlight( pointerEventData );

		if ( !this.isPointerDown ) return;

		if ( !this.currentSelectedObject ) return;

		const road = this.currentSelectedObject.getRoad();

		this.tool.base.handleTargetMovement( pointerEventData, road, ( position: any ) => {

			if ( position instanceof NewLanePosition ) {

				this.currentSelectedObject.s = position.roadDistance;

				this.updateTextMarking( this.currentSelectedObject );

				this.currentSelectedPointMoved = true;

			}

		} );
	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			this.addTextMarking( object );

			this.onSignalSelected( object );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			this.removeTextMarking( object );

			this.onSignalUnselected( object );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			this.updateTextMarking( object );

		} else if ( object instanceof TextMarkingInspector ) {

			this.updateTextMarking( object.signal );

		} else if ( object instanceof SimpleControlPoint ) {

			if ( object.target instanceof TvRoadSignal ) {

				const laneCoord = this.tool.roadService.findLaneCoord( object.position );

				// this.currentSelectedObject.roadId = laneCoord.road.id;

				this.currentSelectedObject.s = laneCoord.laneDistance;

				this.updateTextMarking( object.target );

			}

		}

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			this.onSignalSelected( object );

		} else if ( object instanceof TextMarkingInspector ) {

			this.onSignalSelected( object.signal );

		} else if ( object instanceof SimpleControlPoint ) {

			this.onSignalSelected( object.target );

		} else if ( object instanceof TvRoad ) {

			this.onRoadSelected( object );

		}

	}

	onRoadSelected ( road: TvRoad ): void {

		if ( this.currentSelectedObject ) this.onSignalUnselected( this.currentSelectedObject );

		this.tool.toolDebugger.onSelected( road );

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			this.onSignalUnselected( object );

		} else if ( object instanceof TextMarkingInspector ) {

			this.onSignalUnselected( object.signal );

		} else if ( object instanceof SimpleControlPoint ) {

			this.onSignalUnselected( object.target );

		} else if ( object instanceof TvRoad ) {

			this.tool.toolDebugger.onUnselected( object );

		}

	}

	onSignalSelected ( signal: TvRoadSignal ): void {

		this.currentSelectedPoint?.select();

		AppInspector.setDynamicInspector( new TextMarkingInspector( signal ) );

	}

	onSignalUnselected ( signal: TvRoadSignal ): void {

		this.currentSelectedPoint?.unselect();

		AppInspector.clear();

	}

	addTextMarking ( signal: TvRoadSignal ): void {

		const road = signal.getRoad();

		road.addSignal( signal );

		MapEvents.roadSignalAdded.emit( new RoadSignalAddedEvent( road, signal ) );

		this.tool.toolDebugger.updateDebugState( road, DebugState.SELECTED );

	}

	updateTextMarking ( signal: TvRoadSignal ): void {

		const road = signal.getRoad();

		MapEvents.roadSignalUpdated.emit( new RoadSignalUpdatedEvent( road, signal ) );

		this.tool.toolDebugger.updateDebugState( road, DebugState.SELECTED );

	}

	removeTextMarking ( signal: TvRoadSignal ): void {

		const road = signal.getRoad();

		road.removeRoadSignal( signal );

		MapEvents.roadSignalRemoved.emit( new RoadSignalRemovedEvent( road, signal ) );

		this.tool.toolDebugger.updateDebugState( road, DebugState.SELECTED );

	}

}
