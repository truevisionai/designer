/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import * as THREE from 'three';
import { Camera, Vector3 } from 'three';
import { IViewportController } from './i-viewport-controller';

import 'three/examples/js/controls/EditorControls';

export class EditorControls extends THREE.EditorControls implements IViewportController {


    static getNew ( camera: Camera, canvas: HTMLCanvasElement ) {

        return new EditorControls( camera, canvas );
    }

    setTarget ( position: Vector3 ): void {
        this.center = position;
    }

    getTarget (): Vector3 {
        return undefined;
    }

    setCamera ( camera: Camera ): void {
        this[ 'object' ] = camera;
    }

    setEnabled ( enabled: boolean ): void {
        this.enabled = enabled;
    }

    setPanEnabled ( enabled: boolean ): void {
    }

    setZoomEnabled ( enabled: boolean ): void {
    }

    setRotateEnabled ( enabled: boolean ): void {
    }

    setScreenSpaceEnabled ( enabled: boolean ): void {
    }

    update (): void {
    }

    reset (): void {
    }
}
