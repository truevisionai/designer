/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from '../../events/pointer-event-data';
import { TvLane } from '../../map/models/tv-lane';
import { ToolType } from '../tool-types.enum';
import { LaneToolHelper } from './lane-tool.helper';
import { ToolWithHandler } from '../base-tool-v2';
import { Vector3 } from 'three';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { TvLaneWidth } from 'app/map/models/tv-lane-width';
import { Commands } from 'app/commands/commands';
import { LaneFactory } from 'app/services/lane/lane.factory';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadSelectionStrategy } from 'app/core/strategies/select-strategies/select-road-strategy';
import { LaneVisualizerWithArrows } from 'app/core/visualizers/lane-visualizer';
import { LaneController } from 'app/core/controllers/lane-controller';
import { RoadController } from 'app/core/controllers/road-handler';
import { SelectLaneOverlayStrategy } from "../../core/strategies/select-strategies/object-user-data-strategy";
import { laneToolHints } from './lane-tool.hints';
import { LaneToolRoadVisualizer } from "./lane-tool-road-visualizer";

export class LaneTool extends ToolWithHandler {

	public name: string = 'LaneTool';

	public toolType = ToolType.Lane;

	private startLaneCoord: TvLaneCoord;

	constructor (
		private helper: LaneToolHelper
	) {
		super();

		this.addController( TvLane.name, helper.base.injector.get( LaneController ) );
		this.addController( TvRoad.name, helper.base.injector.get( RoadController ) );

		this.addVisualizer( TvRoad.name, helper.base.injector.get( LaneToolRoadVisualizer ) );
		this.addVisualizer( TvLane.name, helper.base.injector.get( LaneVisualizerWithArrows ) );

		this.setHintConfig( laneToolHints );

	}

	init (): void {

		super.init();

		this.helper.base.reset();

		this.selectionService.registerStrategy( TvLane.name, new SelectLaneOverlayStrategy() );

		this.selectionService.registerStrategy( TvRoad.name, new RoadSelectionStrategy() );

	}

	disable (): void {

		super.disable();

		this.helper.base.reset();

		this.helper.laneDebug.clear();

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.selectionService.handleSelection( e );

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		this.helper.base.selection.handleCreation( e, ( object ) => {

			if ( object instanceof TvLane ) {

				this.startCreation( object, e.point );

				this.helper.base.disableControls();

			}

		} );

	}

	onPointerMoved ( e: PointerEventData ): void {

		this.highlight( e );

		if ( !this.startLaneCoord ) return;

		// const clone: TvRoad = this.startLaneCoord.lane.laneSection.road.clone( 0 );

		// console.log( clone );

		// this.overlayHandlers?.get( TvRoad.name )?.onUpdated( clone );

	}

	onPointerUp ( e: PointerEventData ): void {

		this.helper.base.enableControls();

		if ( !this.startLaneCoord ) return;

		const newLane = this.stopCreation( this.startLaneCoord, e.point );

		Commands.AddObject( newLane );

		this.startLaneCoord = null;

	}

	startCreation ( object: TvLane, start: Vector3 ): void {

		const laneCoord = this.helper.roadService.findLaneCoord( start );

		if ( !laneCoord ) return;

		this.startLaneCoord = laneCoord;

	}

	stopCreation ( laneCoord: TvLaneCoord, end: Vector3 ): TvLane {

		const width = this.calculateLaneWidth( laneCoord, end );

		const lane = LaneFactory.createDuplicate( laneCoord.lane );

		lane.width.splice( 0, lane.width.length );

		lane.width.push( new TvLaneWidth( 0, width, 0, 0, 0, lane ) );

		return lane;

	}

	calculateLaneWidth ( laneCoord: TvLaneCoord, currentPoint: Vector3 ): number {

		const start = this.pointerDownAt.clone();

		const direction = laneCoord.posTheta.toDirectionVector().normalize();

		// Calculate the vector from startPosition to the current drag point
		const offsetVector = currentPoint.clone().sub( start );

		// Calculate the right vector (perpendicular to the lane direction)
		const rightVector = direction.clone().cross( new Vector3( 0, 0, 1 ) ).normalize();

		// Project the toDragPoint vector onto the rightVector to get the lateral distance
		const lateralDistance = offsetVector.dot( rightVector );

		// You can return the lane width or store it as needed
		return Math.max( Math.abs( lateralDistance ), 0.1 );

	}

}


