/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/core/commands/base-command';
import { Material, Texture } from 'three';

export class SetMaterialMapCommand extends BaseCommand {

    private oldMap: Texture | null;

    constructor ( private material: Material, private mapName, private newMap: Texture, private materialSlot ) {

        super();

        this.oldMap = this.material[ mapName ];
    }

    execute (): void {

        this.material[ this.mapName ] = this.newMap;
        this.material[ 'needsUpdate' ] = true;

    }

    undo (): void {

        this.material[ this.mapName ] = this.oldMap;
        this.material[ 'needsUpdate' ] = true;

    }

    redo (): void {

        this.execute();

    }


}
