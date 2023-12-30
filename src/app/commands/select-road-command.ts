import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { BaseCommand } from "./base-command";
import { BaseTool } from "app/tools/base-tool";
import { MapEvents } from "app/events/map-events";
import { RoadSelectedEvent } from "../events/road/road-selected-event";
import { RoadUnselectedEvent } from "../events/road/road-unselected-event";

export class SelectRoadCommand extends BaseCommand {

	private previousRoad: TvRoad;

	constructor ( private tool: BaseTool, private newRoad: TvRoad ) {

		super();

		// if ( tool == null ) throw new Error( 'tool cannot be null' );

		// if ( newRoad == null ) throw new Error( 'newRoad cannot be null' );

		// this.previousRoad = this.tool.getRoad();

	}

	execute (): void {

		// this.tool.setRoad( this.newRoad );

		// MapEvents.roadSelected.emit( new RoadSelectedEvent( this.newRoad ) );

		// if ( this.previousRoad ) MapEvents.roadUnselected.emit( new RoadUnselectedEvent( this.previousRoad ) );

	}

	undo (): void {

		// this.tool.setRoad( this.previousRoad );

		// MapEvents.roadUnselected.emit( new RoadUnselectedEvent( this.newRoad ) );

		// if ( this.previousRoad ) MapEvents.roadSelected.emit( new RoadSelectedEvent( this.previousRoad ) );

	}

	redo (): void {

		this.execute();

	}

}

export class SelectRoadCommandv2 extends BaseCommand {

	constructor ( private newRoad: TvRoad, private previousRoad?: TvRoad ) {

		super();

	}

	execute (): void {

		MapEvents.roadSelected.emit( new RoadSelectedEvent( this.newRoad ) );

	}

	undo (): void {

		if ( this.previousRoad ) {

			MapEvents.roadSelected.emit( new RoadSelectedEvent( this.newRoad ) );

		} else {

			MapEvents.roadUnselected.emit( new RoadUnselectedEvent( this.newRoad ) );

		}

	}

	redo (): void {

		this.execute();

	}

}
