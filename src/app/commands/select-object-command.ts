import { BaseCommand } from "./base-command";
import { MapEvents } from "../events/map-events";

export class SelectObjectCommand extends BaseCommand {

	private readonly objects: any[] = [];

	private readonly previousObjects: any[] = [];

	constructor ( object: any | any[], previousObject?: any | any[] ) {

		super();

		if ( object == null ) throw new Error( 'object cannot be null' );

		if ( Array.isArray( object ) ) {

			this.objects = [ ...object ];

		} else {

			this.objects = [ object ];

		}

		if ( previousObject ) {

			this.previousObjects = Array.isArray( previousObject ) ? [ ...previousObject ] : [ previousObject ];

		}
	}

	execute () {

		this.previousObjects.forEach( previousObject => {

			MapEvents.objectUnselected.emit( previousObject );

		} );

		MapEvents.objectSelected.emit( this.objects.length > 1 ? this.objects : this.objects[ 0 ] );

	}

	undo (): void {

		if ( this.previousObjects.length > 0 ) {

			this.previousObjects.forEach( previousObject => {

				MapEvents.objectSelected.emit( previousObject );

			} );

		} else {

			this.objects.forEach( object => {

				MapEvents.objectUnselected.emit( object );

			} );

		}

	}

	redo (): void {

		this.execute();

	}
}
