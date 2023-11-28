import { PointerEventData } from "app/events/pointer-event-data";
import { BaseTool } from "../base-tool";
import { ToolType } from "../tool-types.enum";
import { ParkingRoadToolService } from "./parking-road-tool.service";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";

export class ParkingRoadTool extends BaseTool {

	name: string;

	toolType: ToolType = ToolType.ParkingRoad;

	points = [];

	constructor (
		private tool: ParkingRoadToolService
	) {
		super();
	}

	init () {

		// do tnighin

	}

	enable (): void {

		super.enable();

	}


	disable (): void {

		super.disable();

		this.tool.hideBoundingBoxes();

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		this.points.push( e.point );

		if ( this.points.length < 2 ) return;

		// const road = this.tool.createLeftParkingRoad( this.points );

		// this.executeAddObject( road );

		this.tool.createParkingLot( this.points[ 0 ], this.points[ 1 ] );

		this.points = [];

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.tool.addRoad( object );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.tool.removeRoad( object );

		}

	}
}
