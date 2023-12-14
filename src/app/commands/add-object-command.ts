import { BaseCommand } from "./base-command";
import { MapEvents } from "../events/map-events";

export class AddObjectCommand extends BaseCommand {

	constructor ( private object: any | any[] ) {

		super();

		if ( object == null ) throw new Error( 'object cannot be null' );
	}

    execute () {

        MapEvents.objectAdded.emit( this.object );

    }

    undo (): void {

        MapEvents.objectRemoved.emit( this.object );

    }

    redo (): void {

        this.execute();

    }

}
