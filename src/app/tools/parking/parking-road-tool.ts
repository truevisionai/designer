/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from "app/events/pointer-event-data";
import { BaseTool } from "../base-tool";
import { ToolType } from "../tool-types.enum";
import { ParkingRoadToolService } from "./parking-road-tool.service";
import { TvRoad } from "app/map/models/tv-road.model";

export class ParkingRoadTool extends BaseTool {

	public name: string = 'Parking Road';

	public toolType: ToolType = ToolType.ParkingRoad;

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

		const road = this.tool.createParkingRoad( this.points );

		this.executeAddObject( road );

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
