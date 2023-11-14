import { BaseCommand } from "./base-command";
import { MapEvents } from "../events/map-events";

export class SelectObjectCommand extends BaseCommand {

    constructor ( private object: any, private previousObject?: any ) {
        super();
    }

    execute () {

        MapEvents.objectSelected.emit( this.object );

    }

    undo (): void {

        if ( this.previousObject ) {

            MapEvents.objectSelected.emit( this.previousObject );

        } else {

            MapEvents.objectUnselected.emit( this.object );

        }

    }

    redo (): void {

        this.execute();

    }
}