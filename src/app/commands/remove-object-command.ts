/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from "./base-command";
import { MapEvents } from "../events/map-events";

export class RemoveObjectCommand extends BaseCommand {

	constructor ( private object: object | object[], private fireUnselectEvent = false ) {
		super();
	}

	execute (): void {

		if ( this.fireUnselectEvent ) {
			MapEvents.objectUnselected.emit( this.object );
		}

		MapEvents.objectRemoved.emit( this.object );

	}

	undo (): void {

		MapEvents.objectAdded.emit( this.object );

		if ( this.fireUnselectEvent ) {
			MapEvents.objectSelected.emit( this.object );
		}

	}

	redo (): void {

		this.execute();

	}

}
