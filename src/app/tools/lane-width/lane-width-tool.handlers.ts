import { Injectable } from "@angular/core";
import { PointController } from "app/core/object-handlers/point-controller";
import { EmptyVisualizer } from "app/core/overlay-handlers/empty-visualizer";
import { NodeVisualizer } from "app/core/overlay-handlers/node-visualizer";
import { PointerEventData } from "app/events/pointer-event-data";
import { TvLaneCoord } from "app/map/models/tv-lane-coord";
import { LaneWidthPoint } from "app/objects/simple-control-point";
import { LaneDebugService } from "app/services/debug/lane-debug.service";
import { LaneWidthPointInspector } from "./lane-width-node-inspector";


@Injectable( {
	providedIn: 'root'
} )
export class LaneCoordVisualizer extends EmptyVisualizer<TvLaneCoord> {

	constructor (
		private laneDebugService: LaneDebugService,
	) {
		super();
	}

	onHighlight ( coord: TvLaneCoord ): void {
		this.laneDebugService.showLaneOutline( coord.lane );
	}

	onSelected ( coord: TvLaneCoord ): void {
		this.laneDebugService.showLaneOutline( coord.lane );
	}

	onDefault ( coord: TvLaneCoord ): void {
		this.laneDebugService.removeLaneOutline( coord.lane );
	}

	onUnselected ( coord: TvLaneCoord ): void {
		this.laneDebugService.removeLaneOutline( coord.lane );
	}


}


@Injectable( {
	providedIn: 'root'
} )
export class LaneWidthPointVisualizer extends NodeVisualizer<LaneWidthPoint> { }


@Injectable( {
	providedIn: 'root'
} )
export class LaneWidthPointController extends PointController<LaneWidthPoint> {

	showInspector ( object: LaneWidthPoint ): void {
		this.setInspector( new LaneWidthPointInspector( object ) );
	}

	onAdded ( object: LaneWidthPoint ): void {
		//
	}

	onUpdated ( object: LaneWidthPoint ): void {
		//
	}

	onRemoved ( object: LaneWidthPoint ): void {
		//
	}

	onDrag ( object: LaneWidthPoint, e: PointerEventData ): void {
		object.setPosition( e.point );
	}

	onDragEnd ( object: LaneWidthPoint, e: PointerEventData ): void {
		object.setPosition( e.point );
	}

}



