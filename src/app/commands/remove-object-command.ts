/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from "./base-command";
import { MapEvents } from "../events/map-events";

export class RemoveObjectCommand extends BaseCommand {

    constructor ( private object: object | object[] ) {
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
