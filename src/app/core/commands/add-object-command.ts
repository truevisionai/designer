/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Object3D } from 'three';
import { SceneService } from '../services/scene.service';
import { BaseCommand } from './base-command';

export class AddObjectCommand extends BaseCommand {

    constructor ( private object: Object3D ) {

        super();

    }

    execute (): void {

        SceneService.add( this.object );

    }

    undo (): void {

        SceneService.remove( this.object );

    }

    redo (): void {

        this.execute();

    }

}
