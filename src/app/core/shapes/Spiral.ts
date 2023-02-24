/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BufferAttribute, BufferGeometry, Line, LineBasicMaterial } from 'three';
import { ARC_SEGMENTS } from './spline-config';

class Spiral {
    curveType;
    mesh;

    constructor ( private points ) {
        const geometry = new BufferGeometry();
        geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( ARC_SEGMENTS * 3 ), 3 ) );
        this.curveType = 'spiral';
        this.mesh = new Line( geometry, new LineBasicMaterial( { color: 0x00ff00, opacity: 0.35 } ) );
        this.mesh.castShadow = true;
        this.mesh.renderOrder = 1;
        this.mesh.frustumCulled = false;
    }

    update (): void {
        // // determine params
        // var sd = SPIRAL.vec2Angle( this.points[ 1 ].x - this.points[ 0 ].x, this.points[ 1 ].z - this.points[ 0 ].z );
        // var ed = SPIRAL.vec2Angle( this.points[ 3 ].x - this.points[ 2 ].x, this.points[ 3 ].z - this.points[ 2 ].z );
        // var k, dk, L, iter;
        // [ k, dk, L, iter ] = SPIRAL.buildClothoid( this.points[ 0 ].x * 100, this.points[ 0 ].z * 100, sd, this.points[ 3 ].x * 100, this.points[ 3 ].z * 100, ed );
        // //console.log(k,dk,L);
        // var spiralarc = SPIRAL.clothoid_1( this.points[ 0 ].x * 100, this.points[ 0 ].z * 100, this.points[ 0 ].y, sd, k, k + dk * L, L, this.points[ 3 ].y, ARC_SEGMENTS - 1 )
        // var position = this.mesh.geometry.attributes.position;
        // for ( var i = 0; i < ARC_SEGMENTS; i++ ) {
        //     position.setXYZ( i, spiralarc[ i ][ 0 ] / 100, spiralarc[ i ][ 2 ], spiralarc[ i ][ 1 ] / 100 );
        // }
        // position.needsUpdate = true;
    }
}
