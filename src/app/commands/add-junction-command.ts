/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvJunction } from "app/modules/tv-map/models/tv-junction";
import { BaseCommand } from "./base-command";
import { JunctionCreatedEvent, JunctionRemovedEvent, MapEvents } from "app/events/map-events";

export class AddJunctionCommand extends BaseCommand {

	constructor ( private junction: TvJunction ) {

		super();

	}

	execute (): void {

		this.map.addJunctionInstance( this.junction );

		MapEvents.junctionCreated.emit( new JunctionCreatedEvent( this.junction ) );

	}

	undo (): void {

		this.map.removeJunction( this.junction );

		MapEvents.junctionRemoved.emit( new JunctionRemovedEvent( this.junction ) );

	}

	redo (): void {

		this.execute();

	}

}
