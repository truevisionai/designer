import { MapEvents, RoadSelectedEvent, RoadUnselectedEvent } from "app/events/map-events";
import { Manager } from "app/managers/manager";
import { RoadService } from "app/services/road/road.service";
import { ToolManager } from "app/tools/tool-manager";

export class RoadSelectionListener extends Manager {

	private static _instance = new RoadSelectionListener();
	private debug = true;

	private roadService: RoadService;

	static get instance (): RoadSelectionListener {
		return this._instance;
	}

	constructor () {

		super();

		this.roadService = new RoadService();

	}

	init () {

		MapEvents.roadSelected.subscribe( e => this.onRoadSelected( e ) );
		MapEvents.roadUnselected.subscribe( e => this.onRoadUnselected( e ) );

	}

	onRoadSelected ( e: RoadSelectedEvent ): void {

		if ( this.debug ) console.debug( e );

		ToolManager.currentTool.onRoadSelected( e.road );

	}

	onRoadUnselected ( e: RoadUnselectedEvent ): void {

		if ( this.debug ) console.debug( e );

		ToolManager.currentTool.onRoadUnselected( e.road );
	}

}
