/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from './base-command';
import { TvLane } from '../../modules/tv-map/models/tv-lane';

export class SetLanePropertyCommand extends BaseCommand {

    private readonly oldValue: any;

    constructor ( private lane: TvLane, private attribute: any, private newValue: any ) {

        super();

        this.oldValue = lane[ attribute ];
    }

    execute (): void {

        this.lane[ this.attribute ] = this.newValue;

    }

    undo (): void {

        this.lane[ this.attribute ] = this.oldValue;

    }

    redo (): void {

        this.execute();

    }


}