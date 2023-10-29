import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { BaseCommand } from "./base-command";
import { BaseTool } from "app/tools/base-tool";
import { MapEvents, RoadSelectedEvent, RoadUnselectedEvent } from "app/events/map-events";

export class UnselectRoadCommand extends BaseCommand {

	constructor ( private tool: BaseTool, private road: TvRoad ) {

		super();

		if ( tool == null ) throw new Error( 'tool cannot be null' );

		if ( road == null ) throw new Error( 'newRoad cannot be null' );

	}

	execute (): void {

		this.tool.setRoad( null );

		MapEvents.roadUnselected.emit( new RoadUnselectedEvent( this.road ) );

	}

	undo (): void {

		this.tool.setRoad( this.road );

		MapEvents.roadSelected.emit( new RoadSelectedEvent( this.road ) );


	}

	redo (): void {

		this.execute();

	}

}
