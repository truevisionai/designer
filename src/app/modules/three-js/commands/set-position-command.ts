/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/core/commands/base-command';

export class SetPositionCommand extends BaseCommand {

    private oldPosition: THREE.Vector3;

    constructor (
        private object: THREE.Object3D,
        private newPosition: THREE.Vector3,
        private optionalOldPosition: THREE.Vector3 = null
    ) {

        super();

        if ( object !== null && newPosition !== null ) {

            this.oldPosition = object.position.clone();
            this.newPosition = newPosition.clone();

        }

        if ( optionalOldPosition !== null ) {

            this.oldPosition = optionalOldPosition.clone();

        }

    }

    execute (): void {

        this.object.position.copy( this.newPosition );
        this.object.updateMatrixWorld( true );

        // this.editor.signals.objectChanged.dispatch( this.object );

    }

    undo (): void {

        this.object.position.copy( this.oldPosition );
        this.object.updateMatrixWorld( true );

        // this.editor.signals.objectChanged.dispatch( this.object );

    }

    redo (): void {

        this.object.position.copy( this.newPosition );
        this.object.updateMatrixWorld( true );

    }
}
