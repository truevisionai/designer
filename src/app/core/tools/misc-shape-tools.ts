/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { BufferGeometry, CubicBezierCurve3, Line, LineBasicMaterial, Vector3 } from 'three';
import { SceneService } from '../services/scene.service';
import { BaseRoadPlanTool } from './base-road-plan-tool';

export class MiscShapeTool extends BaseRoadPlanTool {

    private cps: AnyControlPoint[] = [];

    private curve: any;
    private line: any;

    init () {

        super.init();

    }

    reraw () {

        if ( this.cps.length < 4 ) return;

        if ( this.line != null ) SceneService.remove( this.line, false );

        const positions: Vector3[] = this.cps.map( value => value.position );

        // Create a sine-like wave
        this.curve = new CubicBezierCurve3( positions[ 0 ], positions[ 1 ], positions[ 2 ], positions[ 3 ] );

        const points = this.curve.getPoints( 50 );

        const geometry = new BufferGeometry().setFromPoints( points );

        const material = new LineBasicMaterial( { color: 0xff0000 } );

        // Create the final object to add to the scene
        this.line = new Line( geometry, material );

        this.line.renderOrder = 3;

        SceneService.add( this.line, false );

    }

    protected onControlPointSelected ( cp: AnyControlPoint ) {

    }

    protected onControlPointAdded ( cp: AnyControlPoint ) {

        this.cps.push( cp );

        // this.curve.points.push( cp.position );

        this.reraw();

    }

    protected onControlPointMoved ( e: AnyControlPoint ) {

        this.reraw();

    }

}
