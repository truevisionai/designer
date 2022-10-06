/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Object3D, Vector3 } from 'three';
import { BaseCommand } from '../../../core/commands/base-command';

export class SetScaleCommand extends BaseCommand {

    private readonly oldScale: Vector3;

    constructor (
        private object: Object3D,
        private newScale: Vector3,
        private optionalOldScale: Vector3 = null
    ) {

        super();

        if ( object !== null && newScale !== null ) {

            this.oldScale = object.scale.clone();
            this.newScale = newScale.clone();

        }

        if ( optionalOldScale !== null ) {

            this.oldScale = optionalOldScale.clone();

        }

    }

    execute (): void {

        this.object.scale.copy( this.newScale );
        this.object.updateMatrixWorld( true );

    }

    undo (): void {

        this.object.scale.copy( this.oldScale );
        this.object.updateMatrixWorld( true );

    }

    redo (): void {

        this.execute();

    }

}
