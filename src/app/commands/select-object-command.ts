/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from "./base-command";
import { MapEvents } from "../events/map-events";
import { TvConsole } from "app/core/utils/console";

export class SelectObjectCommand extends BaseCommand {

	private readonly objects: any[] = [];

	private readonly previousObjects: any[] = [];

	constructor ( object: any | any[], previousObject?: any | any[] ) {

		super();

		if ( object == null ) TvConsole.warn( 'object cannot be null' );

		if ( Array.isArray( object ) ) {

			this.objects = [ ...object ];

		} else {

			this.objects = [ object ];

		}

		if ( previousObject ) {

			this.previousObjects = Array.isArray( previousObject ) ? [ ...previousObject ] : [ previousObject ];

		}
	}

	execute (): void {

		this.previousObjects.forEach( object => MapEvents.objectUnselected.emit( object ) );

		this.objects.forEach( object => MapEvents.objectSelected.emit( object ) );

	}

	undo (): void {

		this.objects.forEach( object => MapEvents.objectUnselected.emit( object ) );

		this.previousObjects.forEach( object => MapEvents.objectSelected.emit( object ) );

	}

	redo (): void {

		this.execute();

	}
}
