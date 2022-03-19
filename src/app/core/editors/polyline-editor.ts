/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractShapeEditor } from './abstract-shape-editor';
import * as THREE from 'three';
import { CatmullRomCurve3 } from 'three';
import { SceneService } from '../services/scene.service';

export class PolyLineEditor extends AbstractShapeEditor {

    private curve: CatmullRomCurve3;

    constructor () {

        super();

    }

    public draw () {
        this.drawSpline();
    }

    drawSpline () {

        if ( this.object != null ) SceneService.remove( this.object, false );

        this.curve = new THREE.CatmullRomCurve3( this.controlPointPositions, false, 'catmullrom', 0 );

        let geometry = new THREE.BufferGeometry().setFromPoints( this.curve.points );

        // Create the final object to add to the scene
        this.object = new THREE.Line( geometry, this.material );

        this.object.renderOrder = 2;

        SceneService.add( this.object, false );

        this.curveGeometryChanged.emit( this.curve );
    }

}
