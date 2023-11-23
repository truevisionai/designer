///*
// * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
// */
//
//import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
//import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
//import { LaneOffsetNode } from '../../modules/three-js/objects/lane-offset-node';
//import { BaseCommand } from '../../commands/base-command';
//import { MapEvents, RoadUpdatedEvent } from 'app/events/map-events';
//
//export class UpdateLaneOffsetDistanceCommand extends BaseCommand {
//
//	constructor (
//		private node: LaneOffsetNode,
//		private newDistance: number,
//		private oldDistance?: number,
//		private laneHelper?: OdLaneReferenceLineBuilder
//	) {
//
//		super();
//
//		this.oldDistance = oldDistance || this.node.laneOffset.s;
//
//	}
//
//	execute (): void {
//
//		this.node?.updateScoordinate( this.newDistance );
//
//		this.rebuild( this.node.road );
//
//	}
//
//	undo (): void {
//
//		this.node?.updateScoordinate( this.oldDistance );
//
//		this.rebuild( this.node.road );
//
//	}
//
//	redo (): void {
//
//		this.execute();
//
//	}
//
//	rebuild ( road: TvRoad ): void {
//
//		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( road, false ) );
//
//		this.laneHelper?.drawRoad( road, LineType.SOLID, true );
//
//	}
//
//}
