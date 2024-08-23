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
import { SelectRoadStrategy } from 'app/core/strategies/select-strategies/select-road-strategy';
import { LaneOverlayHandler } from 'app/core/overlay-handlers/lane-overlay-handler.service';
import { LaneToolOverlayHandler } from 'app/core/overlay-handlers/lane-tool.overlay';
import { LaneObjectHandler } from 'app/core/object-handlers/lane-object-handler';
import { RoadObjectHandler } from 'app/core/object-handlers/road-object-handler';
import { ObjectUserDataStrategy } from "../../core/strategies/select-strategies/object-user-data-strategy";
import { laneToolHints } from './lane-tool.hints';

export class LaneTool extends ToolWithHandler<TvLane> {

	public name: string = 'LaneTool';

	public toolType = ToolType.Lane;

	private startLaneCoord: TvLaneCoord;

	constructor (
		private helper: LaneToolHelper
	) {
		super();

		this.objectHandlers = new Map();

		this.objectHandlers.set( TvLane.name, helper.base.injector.get( LaneObjectHandler ) );

		this.objectHandlers.set( TvRoad.name, helper.base.injector.get( RoadObjectHandler ) );

		this.overlayHandlers = new Map();

		this.overlayHandlers.set( TvRoad.name, helper.base.injector.get( LaneToolOverlayHandler ) );

		this.overlayHandlers.set( TvLane.name, helper.base.injector.get( LaneOverlayHandler ) );

		this.setHintConfig( laneToolHints );

	}

	init (): void {

		this.overlayHandlers.forEach( handler => handler.enable() );

		this.helper.base.reset();

		this.selectionService.registerStrategy( TvLane.name, new ObjectUserDataStrategy( 'lane-overlay', 'lane' ) );

		this.selectionService.registerStrategy( TvRoad.name, new SelectRoadStrategy() );

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


