import { MapEvents } from "app/events/map-events";
import { Manager } from "app/managers/manager";
import { RoadService } from "app/services/road/road.service";
import { ToolManager } from "app/tools/tool-manager";
import { RoadSelectedEvent } from "../events/road/road-selected-event";
import { RoadUnselectedEvent } from "../events/road/road-unselected-event";

export class RoadSelectionListener extends Manager {
	debug: any;

	constructor ( private roadService: RoadService ) {

		super();

	}

	init () {

		// MapEvents.roadSelected.subscribe( e => this.onRoadSelected( e ) );
		// MapEvents.roadUnselected.subscribe( e => this.onRoadUnselected( e ) );

	}

	onRoadSelected ( e: RoadSelectedEvent ): void {

		if ( this.debug ) console.debug( e );

		// ToolManager.currentTool.onRoadSelected( e.road );

	}

	onRoadUnselected ( e: RoadUnselectedEvent ): void {

		if ( this.debug ) console.debug( e );

		// ToolManager.currentTool.onRoadUnselected( e.road );
	}

}
