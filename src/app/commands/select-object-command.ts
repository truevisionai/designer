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

		if ( this.previousObjects.length > 0 ) {

			MapEvents.objectUnselected.emit( this.previousObjects.length > 1 ? this.previousObjects : this.previousObjects[ 0 ] );

		}

		MapEvents.objectSelected.emit( this.objects.length > 1 ? this.objects : this.objects[ 0 ] );

	}

	undo (): void {

		MapEvents.objectUnselected.emit( this.objects.length > 1 ? this.objects : this.objects[ 0 ] );

		if ( this.previousObjects.length > 0 ) {

			MapEvents.objectSelected.emit( this.previousObjects.length > 1 ? this.previousObjects : this.previousObjects[ 0 ] );

		}

	}

	redo (): void {

		this.execute();

	}
}
