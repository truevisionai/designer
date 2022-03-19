/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PropInstance } from 'app/core/models/prop-instance.model';
import { PropModel } from 'app/core/models/prop-model.model';
import { DynamicMeta } from 'app/core/models/metadata.model';
import { PropCurve } from "app/modules/tv-map/models/prop-curve";
import { SceneService } from 'app/core/services/scene.service';
import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { AssetDatabase } from './asset-database';
import { Object3D, BufferGeometry, BufferAttribute, Vector3, Triangle } from 'three';
import { Maths } from 'app/utils/maths';
import { PropPolygon } from 'app/modules/tv-map/models/prop-polygons';
import * as THREE from 'three';
import earcut from 'earcut';

export class PropService {

    private static prop?: DynamicMeta<PropModel>;

    static setProp ( prop: DynamicMeta<PropModel> ) {

        this.prop = prop;

    }

    static getProp (): DynamicMeta<PropModel> {

        return this.prop;

    }

    static updateCurveProps ( curve: PropCurve ) {

        if ( !curve ) return;

        if ( curve.spline.controlPoints.length < 2 ) return;

        const length = ( curve.spline as CatmullRomSpline ).getLength();

        if ( length <= 0 ) return;

        curve.props.forEach( prop => SceneService.remove( prop ) );

        curve.props.splice( 0, curve.props.length );

        const spline = curve.spline as CatmullRomSpline;

        const instance = AssetDatabase.getInstance( curve.propGuid ) as Object3D;

        for ( let i = 0; i < length; i += curve.spacing ) {

            const t = spline.curve.getUtoTmapping( 0, i );

            const position = spline.curve.getPoint( t );

            const prop = instance.clone();

            // apply random position variance
            position.setX( position.x + Maths.randomFloatBetween( -curve.positionVariance, curve.positionVariance ) );
            position.setY( position.y + Maths.randomFloatBetween( -curve.positionVariance, curve.positionVariance ) );

            // apply random rotation variance
            prop.rotateX( Maths.randomFloatBetween( -curve.rotation, curve.rotation ) );
            prop.rotateY( Maths.randomFloatBetween( -curve.rotation, curve.rotation ) );
            prop.rotateZ( Maths.randomFloatBetween( -curve.rotation, curve.rotation ) );

            prop.position.copy( position );

            curve.props.push( prop );

            SceneService.add( prop );

        }
    }

    static updateCurvePolygonProps ( polygon: PropPolygon ) {

        polygon.props.forEach( p => SceneService.remove( p ) );

        polygon.props.splice( 0, polygon.props.length );

        const instance = AssetDatabase.getInstance( polygon.propGuid ) as Object3D;


        instance.up.set( 0, 0, 1 );

        instance.updateMatrixWorld( true );



        const vertices = [];

        polygon.spline.controlPointPositions.forEach( p => {
            vertices.push( p.x );
            vertices.push( p.y );
        } );

        // triangulating a polygon with 2d coords0
        const triangles = earcut( vertices );

        const faces = [];

        for ( let i = 0; i < triangles.length; i += 3 ) {

            faces.push( triangles.slice( i, i + 3 ) );

        }

        function randomInTriangle ( v1, v2, v3 ) {

            const r1 = Math.random();

            const r2 = Math.sqrt( Math.random() );

            const a = 1 - r2;

            const b = r2 * ( 1 - r1 );

            const c = r1 * r2;

            return ( v1.clone().multiplyScalar( a ) ).add( v2.clone().multiplyScalar( b ) ).add( v3.clone().multiplyScalar( c ) );
        }


        faces.forEach( face => {

            const v0 = polygon.spline.controlPointPositions[ face[ 0 ] ];
            const v1 = polygon.spline.controlPointPositions[ face[ 1 ] ];
            const v2 = polygon.spline.controlPointPositions[ face[ 2 ] ];

            const t = new Triangle( v0, v1, v2 );

            const area = t.getArea();

            let count = area * polygon.density * polygon.density * polygon.density * 0.5;

            count = Maths.clamp( count, 0, 1000 );

            for ( let i = 0; i < count; i++ ) {

                const position = randomInTriangle( v0, v1, v2 );

                const prop = instance.clone();

                prop.position.copy( position );

                polygon.props.push( prop );

                SceneService.add( prop );

            }

        } )
    }
}