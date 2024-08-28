/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from "./base-command";
import { MapEvents } from "../events/map-events";
import { TvConsole } from "app/core/utils/console";

export class AddObjectCommand extends BaseCommand {

	constructor ( private object: any | any[] ) {

		super();

		if ( object == null ) TvConsole.warn( 'object cannot be null' );
	}

	execute (): void {

		MapEvents.objectAdded.emit( this.object );

	}

	undo (): void {

		MapEvents.objectRemoved.emit( this.object );

	}

	redo (): void {

		this.execute();

	}

}
