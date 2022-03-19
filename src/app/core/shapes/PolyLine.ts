/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3, BufferGeometry, BufferAttribute, Line, LineBasicMaterial } from 'three';
import { COLOR } from 'app/shared/utils/colors.service';
import { MAX_CTRL_POINTS } from "./spline-config";
import { BaseControlPoint } from 'app/modules/three-js/objects/control-point';

export class PolyLine {

    curveType;

    mesh;

    constructor ( public points: BaseControlPoint[] ) {

        const geometry = new BufferGeometry();

        geometry.addAttribute( 'position', new BufferAttribute( new Float32Array( MAX_CTRL_POINTS * 3 ), 3 ) );

        this.curveType = 'polyline';

        this.mesh = new Line( geometry, new LineBasicMaterial( { color: COLOR.WHITE, opacity: 0.35, linewidth: 2 } ) );

        this.mesh.castShadow = true;

        this.mesh.renderOrder = 1;

        this.mesh.frustumCulled = false;
    }

    addPoint ( point: BaseControlPoint ) {

        this.points.push( point );

    }

    // Should be called once after curve control points get updated
    update () {

        if ( this.points.length <= 1 ) return;

        const position = this.mesh.geometry.attributes.position;

        // fill the whole buffer
        for ( let i = 0; i < MAX_CTRL_POINTS; i++ ) {

            const point = i >= this.points.length ? this.points[ this.points.length - 1 ] : this.points[ i ];

            position.setXYZ( i, point.position.x, point.position.y, point.position.z );

        }

        position.needsUpdate = true;
    }
}
