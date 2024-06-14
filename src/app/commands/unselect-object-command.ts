/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from "./base-command";
import { MapEvents } from "../events/map-events";
import { TvConsole } from "app/core/utils/console";

export class UnselectObjectCommand extends BaseCommand {

	private readonly objects: any[] = [];

	constructor ( object: any | any[] ) {

		super();

		if ( object == null ) {

			TvConsole.warn( 'object cannot be null' );

		} else {

			// Normalize the input to always be an array.
			this.objects = Array.isArray( object ) ? [ ...object ] : [ object ];

		}

	}

	execute () {

		this.objects.forEach( object => MapEvents.objectUnselected.emit( object ) );

	}

	undo (): void {

		this.objects.forEach( object => MapEvents.objectSelected.emit( object ) );

	}

	redo (): void {

		this.execute();

	}
}
