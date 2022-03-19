/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractShapeEditor } from './abstract-shape-editor';
import * as THREE from 'three';
import { Curve, Object3D } from 'three';
import { SceneService } from '../services/scene.service';

export class SplineCurveEditor extends AbstractShapeEditor {

    private curve: Curve<any>;
    private line: Object3D;

    constructor () {

        super();

    }

    public draw () {

        if ( this.line != null ) SceneService.remove( this.line, false );

        // Create a sine-like wave
        this.curve = new THREE.CatmullRomCurve3( this.controlPointPositions, false, 'catmullrom', 0 );

        // let points = this.curve.getPoints( 50 );

        let geometry = new THREE.BufferGeometry().setFromPoints( this.controlPointPositions );

        let material = new THREE.LineBasicMaterial( { color: 0xff0000 } );

        // Create the final object to add to the scene
        this.line = new THREE.Line( geometry, material );

        this.line.renderOrder = 3;

        SceneService.add( this.line, false );
    }

}
