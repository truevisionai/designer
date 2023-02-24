/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { TvAbstractRoadGeometry } from 'app/modules/tv-map/models/geometries/tv-abstract-road-geometry';
import { TvArcGeometry } from 'app/modules/tv-map/models/geometries/tv-arc-geometry';
import { TvLineGeometry } from 'app/modules/tv-map/models/geometries/tv-line-geometry';
import { TvParamPoly3Geometry } from 'app/modules/tv-map/models/geometries/tv-param-poly3-geometry';
import { TvSpiralGeometry } from 'app/modules/tv-map/models/geometries/tv-spiral-geometry';
import { TvGeometryType } from 'app/modules/tv-map/models/tv-common';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { BufferAttribute, BufferGeometry, Line, LineBasicMaterial, Vector2, Vector3 } from 'three';
import { SceneService } from '../services/scene.service';
import { AbstractSpline } from './abstract-spline';

import * as SPIRAL from './spiral-math.js';
import { CURVE_TESSEL, CURVE_Y, PARACUBICFACTOR } from './spline-config';
import { HermiteSpline, Length } from './SplineData';

export class ExplicitSpline extends AbstractSpline {

    type: string = 'explicit';

    private segments: Line[] = [];

    // no need for now
    // private tangentLines: Line[] = [];

    constructor ( private road?: TvRoad ) {

        super();

    }

    get hdgs () {

        return this.controlPoints.map( ( cp: RoadControlPoint ) => [ cp.hdg, 7, 7 ] );

    }

    get segTypes () {

        return this.controlPoints.map( ( cp: RoadControlPoint ) => cp.segmentType );

    }

    init (): void {

        // nothing to init

    }

    hide (): void {

        this.controlPoints.forEach( i => i.hide() );

        this.segments.forEach( segment => segment.visible = false );

    }

    show (): void {

        this.controlPoints.forEach( i => i.show() );

        this.segments.forEach( segment => segment.visible = true );

    }

    update (): void {

        for ( let i = 0; i < this.segments.length; i++ ) {

            this.updateSegment( i );

        }

    }

    clear () {

        this.controlPoints.splice( 0, 1 );

        this.segments.forEach( segment => segment.visible = false );

    }

    exportGeometries (): TvAbstractRoadGeometry[] {

        return this.exportFromSpline( this.segTypes, this.hdgs, this.controlPointPositions );

    }

    exportFromSpline ( segTypes: number[], hdgs: number[][], points: Vector3[] ): TvAbstractRoadGeometry[] {

        let totalLength = 0;
        const geometries: TvAbstractRoadGeometry[] = [];

        for ( let i = 0; i < this.segments.length; i++ ) {

            const hdg1 = hdgs[ i ];
            const hdg2 = hdgs[ i + 1 ];

            const dir1 = new Vector2( Math.cos( hdg1[ 0 ] ), Math.sin( hdg1[ 0 ] ) );
            const dir2 = new Vector2( Math.cos( hdg2[ 0 ] ), Math.sin( hdg2[ 0 ] ) );

            // using y instead of z
            const p1 = new Vector2( points[ i ].x, points[ i ].y );
            const p2 = new Vector2( points[ i + 1 ].x, points[ i + 1 ].y );

            const distance = p1.distanceTo( p2 );

            let s = totalLength, x: number, y: number, hdg: number, length: number;

            if ( segTypes[ i ] === TvGeometryType.LINE ) {

                x = p1.x;
                y = p1.y;

                hdg = hdg1[ 0 ];

                length = distance;

                geometries.push( new TvLineGeometry( s, x, y, hdg, length ) );

            } else if ( segTypes[ i ] === TvGeometryType.ARC ) {

                x = p1.x;
                y = p1.y;

                hdg = hdg1[ 0 ];

                let radius, alpha, sign;
                [ radius, alpha, length, sign ] = this.getArcParams( p1, p2, dir1, dir2 );

                // world z is flipped so inverse the sign
                // const curvature = + ( sign < 0 ? 1 : -1 ) + 1 / r;
                let curvature = ( sign > 0 ? 1 : -1 ) * ( 1 / radius );  // sign < for mirror image

                // if radius if infinite then curvature should be the least possible value
                // so its almost close to a line but still an arc
                if ( radius === Infinity ) curvature = Number.MIN_VALUE;

                // because its alsmot a line we can take the arc length as the simple distance between the points
                if ( radius === Infinity ) length = distance;

                geometries.push( new TvArcGeometry( s, x, y, hdg, length, curvature ) );

            } else if ( segTypes[ i ] === TvGeometryType.SPIRAL ) {

                let k, dk, _L, iter;
                [ k, dk, _L, iter ] = SPIRAL.buildClothoid(
                    p1.x,
                    p1.y,
                    SPIRAL.vec2Angle( dir1.x, dir1.y ),
                    p2.x,
                    p2.y,
                    SPIRAL.vec2Angle( dir2.x, dir2.y )
                );

                x = p1.x;
                y = p1.y;

                hdg = hdg1[ 0 ];

                length = _L;

                const curvStart = k;

                const curvEnd = ( k + dk * _L );

                geometries.push( new TvSpiralGeometry( s, x, y, hdg, length, curvStart, curvEnd ) );

            } else if ( segTypes[ i ] === TvGeometryType.PARAMPOLY3 ) {

                const ma = dir1.x, mb = dir1.y, mc = -mb, md = ma;

                const det = 1 / ( ma * md - mb * mc );

                const mia = det * md, mib = -mb * det, mic = -mc * det, mid = ma * det;

                const dir2proj = new Vector2(
                    dir2.x * mia + dir2.y * mic,
                    dir2.x * mib + dir2.y * mid
                );

                /*flip y axis*/
                dir2proj.y = -dir2proj.y;

                const p2proj = new Vector2().subVectors( p2, p1 );

                p2proj.set( p2proj.x * mia + p2proj.y * mic, p2proj.x * mib + p2proj.y * mid );

                /*flip y axis*/
                p2proj.y = -p2proj.y;

                x = p1.x;
                y = p1.y;

                hdg = hdg1[ 0 ];

                length = distance; //TODO fix this

                const t1 = new Vector2( 1, 0 ).multiplyScalar( PARACUBICFACTOR * hdgs[ i ][ 1 ] );
                const t2 = new Vector2( dir2proj.x, dir2proj.y ).multiplyScalar( PARACUBICFACTOR * hdgs[ i + 1 ][ 2 ] );

                const hs = HermiteSpline( new Vector2( 0, 0 ), p2proj, t1, t2 );

                length = Length( hs, 0.001 );

                const f3 = new Vector2( -2 * p2proj.x + 1 * t1.x + 1 * t2.x, -2 * p2proj.y + 1 * t1.y + 1 * t2.y );
                const f2 = new Vector2( 3 * p2proj.x - 2 * t1.x - 1 * t2.x, 3 * p2proj.y - 2 * t1.y - 1 * t2.y );
                const f1 = new Vector2( 1 * t1.x, 1 * t1.y );

                const aU = 0;
                const bU = f1.x;
                const cU = f2.x;
                const dU = f3.x;

                const aV = 0;
                const bV = f1.y;
                const cV = f2.y;
                const dV = f3.y;

                geometries.push( new TvParamPoly3Geometry( s, x, y, hdg, length, aU, bU, cU, dU, aV, bV, cV, dV ) );
            }

            totalLength += length;

        }

        return geometries;
    }

	/**
	 *
	 * @param cp
	 * @deprecated
	 */
    addControlPoint ( cp: AnyControlPoint ) {

        cp.visible = false;

        this.addControlPointAtNew( cp.position );

    }

    addControlPointAtNew ( position: Vector3 ) {

        const index = this.segTypes.length;

        const previousPoint = this.controlPoints[ index - 1 ] as RoadControlPoint;

        let hdg: number = 0;

        if ( previousPoint ) {

            // need to set previous point to spiral to avoid bugs
            previousPoint.segmentType = TvGeometryType.SPIRAL;

            hdg = SPIRAL.vec2Angle( previousPoint.position.x, previousPoint.position.y );
        }

        return this.addFromFile( index, position, hdg, TvGeometryType.SPIRAL );
    }

    addFromFile ( index: number, position: Vector3, hdg: number, segType: TvGeometryType ) {

        // this.segTypes.push( segType );

        const controlPoint = new RoadControlPoint( this.road, position, 'cp', index, index );

        controlPoint.segmentType = segType;

        // TODO: move this in spline mesh or somewhere else
        SceneService.add( controlPoint );

        this.controlPoints.push( controlPoint );

        controlPoint.hdg = hdg;

        controlPoint.addDefaultTangents( hdg, 1, 1 );

        // update tangent line
        // this.tangent.update( this.hdgs, this.tangentLines );

        if ( index > 0 ) {

            // add empty curve mesh
            this.addSegment( index - 1 );

            // calculate curve mesh
            this.updateSegment( index - 1 );

        }

        return controlPoint;
    }

    addSegment ( index: number ) {

        const geometry = new BufferGeometry();

        geometry.attributes.position = new BufferAttribute( new Float32Array( CURVE_TESSEL * 3 ), 3 );

        const line = new Line( geometry, new LineBasicMaterial( { color: 0x0000ff, opacity: 0.35, linewidth: 2 } ) );

        line[ 'tag' ] = 'curve';

        line[ 'tagindex' ] = index;

        line.castShadow = true;

        line.renderOrder = 3;

        line.frustumCulled = false;

        this.segments.push( line );

        this.scene.add( line );

        // this.tangentLines.push( line );
    }

    updateSegment ( idx: number ) {

        const mesh = this.segments[ idx ];
        const posattr = ( mesh.geometry as BufferGeometry ).attributes.position as BufferAttribute;

        const dir1 = new Vector2( Math.cos( this.hdgs[ idx ][ 0 ] ), Math.sin( this.hdgs[ idx ][ 0 ] ) );
        const dir2 = new Vector2( Math.cos( this.hdgs[ idx + 1 ][ 0 ] ), Math.sin( this.hdgs[ idx + 1 ][ 0 ] ) );

        const p1 = this.controlPointPositions[ idx ];
        const p2 = this.controlPointPositions[ idx + 1 ];

        const L = p1.distanceTo( p2 );

        if ( this.segTypes[ idx ] == TvGeometryType.LINE ) {

            posattr.setXYZ( 0, p1.x, p1.y, p1.z );
            posattr.setXYZ( 1, p2.x, p2.y, p2.z );

            for ( let ii = 2; ii < CURVE_TESSEL; ii++ ) {
                posattr.setXYZ( ii, p2.x, p2.y, p2.z );
            }

            posattr.needsUpdate = true;

        } else if ( this.segTypes[ idx ] == TvGeometryType.ARC ) {

            const alpha = Math.acos( dir1.dot( dir2 ) );

            // let advx = new Vector2( p2.x - p1.x, p2.z - p1.z ).normalize();
            const advx = new Vector2( p2.x - p1.x, p2.y - p1.y ).normalize();
            const advy = new Vector2( -advx.y, advx.x );

            // get inverse matrix of p1 local space transform
            const ma = dir1.x, mb = dir1.y, mc = -mb, md = ma;
            const det = 1 / ( ma * md - mb * mc );
            const mia = det * md, mib = -mb * det, mic = -mc * det, mid = ma * det;

            // project p2 into p1 local space
            const arcdir = new Vector2( advx.x * mia + advx.y * mic, advx.x * mib + advx.y * mid );

            // flip y axis according to arcdir (world z is flipped so inverse the sign)
            advy.multiplyScalar( -Math.sign( arcdir.y ) );

            for ( let ii = 0; ii < CURVE_TESSEL; ii++ ) {

                const theta = ii / ( CURVE_TESSEL - 1 ) * alpha;

                const gamma = ( alpha - theta ) / 2;

                const d = L * Math.sin( theta / 2 ) / Math.sin( alpha / 2 );

                // posattr.setXYZ( ii, p1.x + advx.x * Math.cos( gamma ) * d + advy.x * Math.sin( gamma ) * d, CURVE_Y, p1.z + advx.y * Math.cos( gamma ) * d + advy.y * Math.sin( gamma ) * d );
                posattr.setXYZ( ii, p1.x + advx.x * Math.cos( gamma ) * d + advy.x * Math.sin( gamma ) * d, p1.y + advx.y * Math.cos( gamma ) * d + advy.y * Math.sin( gamma ) * d, CURVE_Y );
            }

            posattr.needsUpdate = true;

        } else if ( this.segTypes[ idx ] == TvGeometryType.SPIRAL ) {

            const sd = SPIRAL.vec2Angle( dir1.x, dir1.y );
            const ed = SPIRAL.vec2Angle( dir2.x, dir2.y );

            // axis issue
            // let k, dk, _L, iter;[ k, dk, _L, iter ] = SPIRAL.buildClothoid( p1.x * 100, p1.z * 100, sd, p2.x * 100, p2.z * 100, ed );
            let k, dk, _L, iter;
            [ k, dk, _L, iter ] = SPIRAL.buildClothoid( p1.x * 100, p1.y * 100, sd, p2.x * 100, p2.y * 100, ed );

            // axis issue
            // let spiralarc = SPIRAL.clothoid_1( p1.x * 100, p1.z * 100, p1.y, sd, k, k + dk * _L, _L, p2.y, CURVE_TESSEL - 1 )
            const spiralarc = SPIRAL.clothoid_1( p1.x * 100, p1.y * 100, p1.y, sd, k, k + dk * _L, _L, p2.y, CURVE_TESSEL - 1 );

            for ( let ii = 0; ii < CURVE_TESSEL; ii++ ) {
                // axis issue
                // posattr.setXYZ( ii, spiralarc[ ii ][ 0 ] / 100, spiralarc[ ii ][ 2 ], spiralarc[ ii ][ 1 ] / 100 );
                // posattr.setXYZ( ii, spiralarc[ ii ][ 0 ] / 100, spiralarc[ ii ][ 1 ] / 100, spiralarc[ ii ][ 2 ] );
                posattr.setXYZ( ii, spiralarc[ ii ][ 0 ] / 100, spiralarc[ ii ][ 1 ] / 100, 0 );
            }

            posattr.needsUpdate = true;

        } else if ( this.segTypes[ idx ] == TvGeometryType.PARAMPOLY3 ) {

            const t1 = new Vector3( dir1.x, dir1.y, CURVE_Y ).multiplyScalar( PARACUBICFACTOR * this.hdgs[ idx ][ 1 ] );
            const t2 = new Vector3( dir2.x, dir2.y, CURVE_Y ).multiplyScalar( PARACUBICFACTOR * this.hdgs[ idx + 1 ][ 2 ] );

            const posfoo = new Vector3();

            for ( let ii = 0; ii < CURVE_TESSEL; ii++ ) {
                const s = ii / ( CURVE_TESSEL - 1 ), s2 = s * s, s3 = s2 * s;
                const h1 = new Vector3().setScalar( 2 * s3 - 3 * s2 + 1 ).multiply( p1 );
                const h2 = new Vector3().setScalar( -2 * s3 + 3 * s2 ).multiply( p2 );
                const h3 = new Vector3().setScalar( s3 - 2 * s2 + s ).multiply( t1 );
                const h4 = new Vector3().setScalar( s3 - s2 ).multiply( t2 );
                posfoo.copy( h1 ).add( h2 ).add( h3 ).add( h4 );
                posattr.setXYZ( ii, posfoo.x, posfoo.y, posfoo.z );
            }

            posattr.needsUpdate = true;
        }
    }

	/**
	 * returns position on the curve
	 * @param t A position on the curve. Must be in the range [ 0, 1 ].
	 */
    getPoint ( t: number, offset = 0 ): Vector3 {

        const geometries = this.exportGeometries();

        const length = geometries.map( g => g.length ).reduce( ( a, b ) => a + b );

        const s = length * t;

        const geometry = geometries.find( g => s >= g.s && s <= g.s2 );

        const posTheta = new TvPosTheta();

        geometry.getCoords( s, posTheta );

        posTheta.addLateralOffset( offset );

        return posTheta.toVector3();
    }

    getLength () {

        const geometries = this.exportGeometries();

        let length = 0;

        for ( let i = 0; i < geometries.length; i++ ) {

            length += geometries[ i ].length;

        }

        return length;
    }
}
