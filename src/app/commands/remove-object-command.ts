import { BaseCommand } from "./base-command";
import { MapEvents } from "../events/map-events";

export class RemoveObjectCommand extends BaseCommand {

    constructor ( private object: any ) {
        super();
    }

    execute () {

        MapEvents.objectRemoved.emit( this.object );

    }

    undo (): void {

        MapEvents.objectAdded.emit( this.object );

    }

    redo (): void {

        this.execute();

    }

}