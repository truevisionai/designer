/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { TvAbstractRoadGeometry } from 'app/modules/tv-map/models/geometries/tv-abstract-road-geometry';
import { BufferAttribute, BufferGeometry, Group, Line, LineBasicMaterial, Vector2, Vector3 } from 'three';
import { AbstractSpline } from './abstract-spline';
import { CURVE_TESSEL, CURVE_Y, PARACUBICFACTOR } from './spline-config';
import { HermiteSpline, Length } from './SplineData';
import { TangentLine } from './TangentLine';

export class ParametricSpline extends AbstractSpline {

    public type: string = 'parametric';

    public mesh: Group;

	/**
	 * the main control points of the curve, not tangent points
	 */
    public controlObjects: AnyControlPoint[] = [];

    private tangent: TangentLine;

    // private polyline: PolyLine;

    // private roundline: RoundLine;

    private hdgs: any[] = [];

	/**
	 * Holds reference to the line segments forming the whole curve
	 */
    private segments: Line[] = [];

    constructor ( private parent: any ) {

        super();

    }

    init (): void {

        this.mesh = new Group();

        this.tangent = new TangentLine( this.controlPointPositions );

        // this.polyline = new PolyLine( this.controlPointPositions );

        // this.roundline = new RoundLine( this.controlPointPositions );

        if ( this.meshAddedInScene ) return;

        this.mesh.add( this.tangent.mesh );

        this.scene.add( this.mesh );

        // this.scene.add( this.polyline.mesh );

        // this.scene.add( this.roundline.mesh );

        this.meshAddedInScene = true;

    }


    hide (): void {

        this.controlPoints.forEach( i => i.visible = false );

        this.tangent.mesh.visible = false;

        // this.polyline.mesh.visible = false;

        // this.roundline.mesh.visible = false;

    }

    show (): void {

        this.controlPoints.forEach( i => i.visible = true );

        this.tangent.mesh.visible = true;

        // this.polyline.mesh.visible = true;

        // this.roundline.mesh.visible = true;

    }

    hideAllTangents () {

        this.controlObjects.forEach( ( cp: AnyControlPoint ) => {

            this.hideTangenAt( cp.tagindex );

        } );

    }

    showControlObjects () {

        this.controlObjects.forEach( co => co.visible = true );

    }

    hideControlObjects () {

        this.controlObjects.forEach( co => co.visible = false );

    }

    showTangentsAt ( id: number ) {

        this.controlPoints[ this.controlObjects.length + id * 2 + 0 ].visible = true;
        this.controlPoints[ this.controlObjects.length + id * 2 + 1 ].visible = true;

        this.tangent.updateOneSegment( id, this.controlObjects[ id ] );

    }

    hideTangenAt ( id: number ) {

        this.controlPoints[ this.controlObjects.length + id * 2 + 0 ].visible = false;
        this.controlPoints[ this.controlObjects.length + id * 2 + 1 ].visible = false;

    }

    update (): void {

    }

    updateSpine ( cp: AnyControlPoint ) {

        if ( cp.tag == 'cp' || cp.tag == 'tpf' || cp.tag == 'tpb' ) {

            let ptidx = cp.tagindex;

            if ( cp.tag == 'cp' ) {

                // do nothing for now

            } else if ( cp.tag == 'tpf' ) {

                const delta = new Vector3().subVectors(
                    this.controlPoints[ this.controlObjects.length + ptidx * 2 ].position,
                    this.controlPoints[ ptidx ].position
                );

                this.hdgs[ ptidx ][ 0 ] = Math.atan2( delta.y, delta.x );

                this.hdgs[ ptidx ][ 1 ] = delta.length();

            }

            // tslint:disable-next-line: one-line
            else if ( cp.tag == 'tpb' ) {

                const delta = new Vector3().subVectors(
                    this.controlPoints[ this.controlObjects.length + ptidx * 2 + 1 ].position,
                    this.controlPoints[ ptidx ].position
                );

                this.hdgs[ ptidx ][ 0 ] = Math.PI + Math.atan2( delta.y, delta.x );

                this.hdgs[ ptidx ][ 2 ] = delta.length();

            }

            let pa: Vector3, pb: Vector3;

            [ pa, pb ] = this.tangent.updateOneSegment( ptidx, this.controlPoints[ ptidx ].position );

            this.controlPoints[ this.controlObjects.length + ptidx * 2 ].position.copy( pa );

            this.controlPoints[ this.controlObjects.length + ptidx * 2 + 1 ].position.copy( pb );

            if ( ptidx < this.segments.length ) {

                this.updateSegment( ptidx );

            }

            if ( ptidx - 1 >= 0 ) {

                this.updateSegment( ptidx - 1 );

            }

        }

    }

    exportGeometries (): TvAbstractRoadGeometry[] {

        throw Error( 'method nor implew' );

    }

    exportFromSpline (): TvAbstractRoadGeometry[] {

        throw Error( 'method nor implew' );
    }

    add ( position: AnyControlPoint, heading: number, newIndex: number ): AnyControlPoint {

        const controlPointObject = this.createControlPoint( 'cp', newIndex, newIndex );

        this.controlObjects.push( controlPointObject );

        controlPointObject.copyPosition( position.position );

        this.hdgs.push( [ heading, 7, 7 ] );

        const tgX = Math.cos( heading );

        const tgY = Math.sin( heading );

        const frontTangentPosition = new Vector3( tgX, tgY, CURVE_Y )
            .multiplyScalar( this.hdgs[ newIndex ][ 1 ] )
            .add( this.controlPointPositions[ newIndex ] );

        const backTangentPosition = new Vector3( tgX, tgY, CURVE_Y )
            .multiplyScalar( -this.hdgs[ newIndex ][ 2 ] )
            .add( this.controlPointPositions[ newIndex ] );

        const frontTanget = this.createControlPoint( 'tpf', newIndex, newIndex + 1 + newIndex * 2 );

        frontTanget.position.copy( frontTangentPosition );

        const backTanget = this.createControlPoint( 'tpb', newIndex, newIndex + 1 + newIndex * 2 + 1 );

        backTanget.position.copy( backTangentPosition );

        // update tangent line
        this.tangent.update( this.hdgs, this.controlObjects );

        if ( newIndex > 0 ) {

            // add empty curve mesh
            this.addNewSegment( newIndex - 1 );

            // calculate curve mesh
            this.updateSegment( newIndex - 1 );

        }

        this.tangent.updateOneSegment( newIndex, controlPointObject );

        return controlPointObject;
    }

    addNewSegment ( idx ) {

        const buffgeo = new BufferGeometry();

        buffgeo.attributes.position = new BufferAttribute( new Float32Array( CURVE_TESSEL * 3 ), 3 );

        const curvemesh = new Line( buffgeo, new LineBasicMaterial( { color: 0x0000ff, opacity: 0.35, linewidth: 2 } ) );

        curvemesh[ 'tag' ] = 'curve';

        curvemesh[ 'tagindex' ] = idx;

        curvemesh.userData.parent = this.parent;

        this.segments.push( curvemesh );

        this.scene.add( curvemesh );

        // this.controlPointLines.push( curvemesh );

    }

    updateSegment ( idx: number ) {

        const curvemesh = this.segments[ idx ];

        if ( !curvemesh ) {

            console.error( 'curve not found', idx, this.segments );

            return;

        } else {

        }


        const posattr = ( curvemesh.geometry as BufferGeometry ).attributes.position as BufferAttribute;

        const dir1 = new Vector2( Math.cos( this.hdgs[ idx ][ 0 ] ), Math.sin( this.hdgs[ idx ][ 0 ] ) );
        const dir2 = new Vector2( Math.cos( this.hdgs[ idx + 1 ][ 0 ] ), Math.sin( this.hdgs[ idx + 1 ][ 0 ] ) );

        const p1 = this.controlPointPositions[ idx ];
        const p2 = this.controlPointPositions[ idx + 1 ];

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

    getPoint ( s: number, target?: Vector3 ) {

        for ( let i = 0; i < this.segments.length; i++ ) {

            const segment = this.segments[ i ];
            const segmentLength = this.getSegmentLength( i );

            if ( s <= segmentLength ) {


                return this.getPointInSegment( ( segmentLength - s ) / segmentLength, i );

                break;
            }

        }
    }

    Hermite_Interpolate ( y0, y1, y2, y3, mu, tension, bias ) {

        let m0, m1, mu2, mu3;

        let a0, a1, a2, a3;

        mu2 = mu * mu;

        mu3 = mu2 * mu;

        m0 = ( y1 - y0 ) * ( 1 + bias ) * ( 1 - tension ) / 2;

        m0 += ( y2 - y1 ) * ( 1 - bias ) * ( 1 - tension ) / 2;

        m1 = ( y2 - y1 ) * ( 1 + bias ) * ( 1 - tension ) / 2;

        m1 += ( y3 - y2 ) * ( 1 - bias ) * ( 1 - tension ) / 2;

        a0 = 2 * mu3 - 3 * mu2 + 1;

        a1 = mu3 - 2 * mu2 + mu;

        a2 = mu3 - mu2;

        a3 = -2 * mu3 + 3 * mu2;

        return ( a0 * y1 + a1 * m0 + a2 * m1 + a3 * y2 );
    }


    // getPoints ( spacing = 5 ) {

    //     const positions = [];

    //     for ( let i = 0; i < this.segments.length; i++ ) {

    //         const segment = this.segments[ i ];
    //         const segmentLength = this.getSegmentLength( i );

    //         const p1 = this.controlPointPositions[ i ];
    //         const p2 = this.controlPointPositions[ i + 1 ];
    //         const t1 = this.controlPoints[ this.controlObjects.length + i * 2 + 0 ].position;
    //         const t2 = this.controlPoints[ this.controlObjects.length + ( i + 1 ) * 2 + 1 ].position;

    //         for ( let t = 0; t < segmentLength; t++ ) {

    //             // const x = this.Hermite_Interpolate( t2.x, p2.x, p1.x, t1.x, t / segmentLength, 0, 0 );
    //             // const y = this.Hermite_Interpolate( t2.y, p2.y, p1.y, t1.y, t / segmentLength, 0, 0 );

    //             const x = this.Hermite_Interpolate( t1.x, p2.x, p1.x, t2.x, t / segmentLength, 0, 0 );
    //             const y = this.Hermite_Interpolate( t1.y, p2.y, p1.y, t2.y, t / segmentLength, 0, 0 );

    //             positions.push( new Vector3( x, y, 0 ) );

    //         }
    //     }

    //     return positions;
    // }

    getPoints ( spacing = 10 ) {

        const positions = [];

        for ( let i = 0; i < this.segments.length; i++ ) {

            const segment = this.segments[ i ];
            const segmentLength = this.getSegmentLength( i );

            const dir1 = new Vector2( Math.cos( this.hdgs[ i ][ 0 ] ), Math.sin( this.hdgs[ i ][ 0 ] ) );
            const dir2 = new Vector2( Math.cos( this.hdgs[ i + 1 ][ 0 ] ), Math.sin( this.hdgs[ i + 1 ][ 0 ] ) );

            const p1 = this.controlPointPositions[ i ];
            const p2 = this.controlPointPositions[ i + 1 ];

            const t1 = new Vector3( dir1.x, dir1.y, CURVE_Y ).multiplyScalar( PARACUBICFACTOR * this.hdgs[ i ][ 1 ] );
            const t2 = new Vector3( dir2.x, dir2.y, CURVE_Y ).multiplyScalar( PARACUBICFACTOR * this.hdgs[ i + 1 ][ 2 ] );

            for ( let u = 0; u < segmentLength; u += spacing ) {

                const t = this.getUtoTmapping( u / segmentLength, 10 );

                const s = t, s2 = s * s, s3 = s2 * s;

                const h1 = new Vector3().setScalar( 2 * s3 - 3 * s2 + 1 ).multiply( p1 );
                const h2 = new Vector3().setScalar( -2 * s3 + 3 * s2 ).multiply( p2 );
                const h3 = new Vector3().setScalar( s3 - 2 * s2 + s ).multiply( t1 );
                const h4 = new Vector3().setScalar( s3 - s2 ).multiply( t2 );

                const position = new Vector3().copy( h1 ).add( h2 ).add( h3 ).add( h4 );

                positions.push( position );

            }
        }

        return positions;
    }


    getUtoTmapping ( u, distance ) {

        const arcLengths = this.getLengths( 10 );

        let i = 0;
        const il = arcLengths.length;

        let targetArcLength; // The targeted u distance value to get

        if ( distance ) {

            targetArcLength = distance;

        } else {

            targetArcLength = u * arcLengths[ il - 1 ];

        }

        // binary search for the index with largest value smaller than target u distance

        let low = 0, high = il - 1, comparison;

        while ( low <= high ) {

            // less likely to overflow, though probably not issue here, JS doesn't really have integers, all numbers are floats
            i = Math.floor( low + ( high - low ) / 2 );

            comparison = arcLengths[ i ] - targetArcLength;

            if ( comparison < 0 ) {

                low = i + 1;

            } else if ( comparison > 0 ) {

                high = i - 1;

            } else {

                high = i;
                break;

                // DONE

            }

        }

        i = high;

        if ( arcLengths[ i ] === targetArcLength ) {

            return i / ( il - 1 );

        }

        // we could get finer grain at lengths, or use simple interpolation between two points

        const lengthBefore = arcLengths[ i ];
        const lengthAfter = arcLengths[ i + 1 ];

        const segmentLength = lengthAfter - lengthBefore;

        // determine where we are between the 'before' and 'after' points

        const segmentFraction = ( targetArcLength - lengthBefore ) / segmentLength;

        // add that fractional amount to t

        const t = ( i + segmentFraction ) / ( il - 1 );

        return t;

    }


    // getPoints ( spacing = 5 ) {

    //     const positions = [];

    //     for ( let i = 0; i < this.segments.length; i++ ) {

    //         const position = new Vector3();

    //         const segment = this.segments[ i ];
    //         const segmentLength = this.getSegmentLength( i );

    //         const hdg1 = this.hdgs[ i ];
    //         const hdg2 = this.hdgs[ i + 1 ];

    //         const dir1 = new Vector2( Math.cos( hdg1[ 0 ] ), Math.sin( hdg1[ 0 ] ) );
    //         const dir2 = new Vector2( Math.cos( hdg2[ 0 ] ), Math.sin( hdg2[ 0 ] ) );

    //         const p1 = new Vector2( this.controlObjects[ i ].position.x, this.controlObjects[ i ].position.y );
    //         const p2 = new Vector2( this.controlObjects[ i + 1 ].position.x, this.controlObjects[ i + 1 ].position.y );

    //         const ma = dir1.x, mb = dir1.y, mc = -mb, md = ma;

    //         const det = 1 / ( ma * md - mb * mc );

    //         const mia = det * md, mib = -mb * det, mic = -mc * det, mid = ma * det;

    //         const dir2proj = new Vector2(
    //             dir2.x * mia + dir2.y * mic,
    //             dir2.x * mib + dir2.y * mid
    //         );

    //         /*flip y axis*/
    //         dir2proj.y = -dir2proj.y;

    //         const p2proj = new Vector2().subVectors( p2, p1 );

    //         p2proj.set( p2proj.x * mia + p2proj.y * mic, p2proj.x * mib + p2proj.y * mid );

    //         /*flip y axis*/
    //         p2proj.y = -p2proj.y;

    //         const hdg = hdg1[ 0 ];

    //         const t1 = new Vector2( 1, 0 ).multiplyScalar( PARACUBICFACTOR * this.hdgs[ i ][ 1 ] );
    //         const t2 = new Vector2( dir2proj.x, dir2proj.y ).multiplyScalar( PARACUBICFACTOR * this.hdgs[ i + 1 ][ 2 ] );

    //         const hs = HermiteSpline( new Vector2( 0, 0 ), p2proj, t1, t2 );
    //         const length = Length( hs, 0.001 );

    //         const f3 = new Vector2( -2 * p2proj.x + 1 * t1.x + 1 * t2.x, -2 * p2proj.y + 1 * t1.y + 1 * t2.y );
    //         const f2 = new Vector2( 3 * p2proj.x - 2 * t1.x - 1 * t2.x, 3 * p2proj.y - 2 * t1.y - 1 * t2.y );
    //         const f1 = new Vector2( 1 * t1.x, 1 * t1.y );

    //         const aU = 0;
    //         const bU = f1.x;
    //         const cU = f2.x;
    //         const dU = f3.x;

    //         const aV = 0;
    //         const bV = f1.y;
    //         const cV = f2.y;
    //         const dV = f3.y;

    //         const steps = segmentLength / spacing;

    //         for ( let ii = 0; ii < segmentLength; ii += steps ) {

    //             // normalised p between 0 to 1
    //             const p = ii / length;

    //             const uLocal =
    //                 ( aU ) +
    //                 ( bU * p ) +
    //                 ( cU * p * p ) +
    //                 ( dU * p * p * p );

    //             const vLocal =
    //                 ( aV ) +
    //                 ( bV * p ) +
    //                 ( cV * p * p ) +
    //                 ( dV * p * p * p );

    //             // Derivate to get heading change
    //             // const dCoeffsU = ( new Vector3( bU, cU, dU ) ).multiply( new Vector3( 1, 2, 3 ) );
    //             // const dCoeffsV = ( new Vector3( bV, cV, dV ) ).multiply( new Vector3( 1, 2, 3 ) );

    //             // const dx = this.polyeval( p, dCoeffsU );
    //             // const dy = this.polyeval( p, dCoeffsV );

    //             // const tangent = Math.atan2( dy, dx );

    //             // apply rotation with respect to start
    //             const xnew = p1.x + uLocal;
    //             const ynew = p1.y + vLocal;

    //             position.set( xnew, ynew, 0 );

    //             positions.push( position );
    //         }
    //     }

    //     return positions;
    // }

    polyeval ( t: number, v: Vector3 ): number {

        return ( v.x ) + ( v.y * t ) + ( v.z * t * t );
    }

    getPointInSegment ( t: number, id: number, rettarget?: Vector3 ): Vector3 {

        const p1 = this.controlPointPositions[ id ];
        const p2 = this.controlPointPositions[ id + 1 ];
        const p3 = this.controlPoints[ this.controlObjects.length + id * 2 + 0 ].position;
        const p4 = this.controlPoints[ this.controlObjects.length + ( id + 1 ) * 2 + 1 ].position;

        const s = t, s2 = s * s, s3 = s2 * s;

        const h1 = new Vector3().setScalar( 2 * s3 - 3 * s2 + 1 ).multiply( p1 );
        const h2 = new Vector3().setScalar( -2 * s3 + 3 * s2 ).multiply( p2 );
        const h3 = new Vector3().setScalar( s3 - 2 * s2 + s ).multiply( p3 );
        const h4 = new Vector3().setScalar( s3 - s2 ).multiply( p4 );

        const posfoo = new Vector3();

        posfoo.copy( h1 ).add( h2 ).add( h3 ).add( h4 );

        return posfoo;

        // const dir1 = new Vector2( Math.cos( this.hdgs[ id ][ 0 ] ), Math.sin( this.hdgs[ id ][ 0 ] ) );
        // const dir2 = new Vector2( Math.cos( this.hdgs[ id + 1 ][ 0 ] ), Math.sin( this.hdgs[ id + 1 ][ 0 ] ) );

        // const p1 = this.controlPointPositions[ id ];
        // const p2 = this.controlPointPositions[ id + 1 ];

        // const t1 = new Vector3( dir1.x, dir1.y, CURVE_Y ).multiplyScalar( PARACUBICFACTOR * this.hdgs[ id ][ 1 ] );
        // const t2 = new Vector3( dir2.x, dir2.y, CURVE_Y ).multiplyScalar( PARACUBICFACTOR * this.hdgs[ id + 1 ][ 2 ] );

        // // const t1Pos = this.controlPoints[ this.controlObjects.length + id * 2 + 0 ].position;
        // // const t2Pos = this.controlPoints[ this.controlObjects.length + ( id + 1 ) * 2 + 1 ].position;

        // // const t1 = new Vector3().subVectors( t1Pos, p1 ).multiplyScalar( PARACUBICFACTOR );
        // // const t2 = new Vector3().subVectors( p2, t2Pos ).multiplyScalar( PARACUBICFACTOR );

        // const posfoo = new Vector3();

        // // for ( let ii = 0; ii < CURVE_TESSEL; ii++ ) {

        // const s = t, s2 = s * s, s3 = s2 * s;

        // const h1 = new Vector3().setScalar( 2 * s3 - 3 * s2 + 1 ).multiply( p1 );

        // const h2 = new Vector3().setScalar( -2 * s3 + 3 * s2 ).multiply( p2 );

        // const h3 = new Vector3().setScalar( s3 - 2 * s2 + s ).multiply( t1 );

        // const h4 = new Vector3().setScalar( s3 - s2 ).multiply( t2 );

        // posfoo.copy( h1 ).add( h2 ).add( h3 ).add( h4 );

        // return posfoo;

        // // posattr.setXYZ( ii, posfoo.x, posfoo.y, posfoo.z );

        // }


        // const retpoint = rettarget || new Vector3();

        // const p1 = this.controlObjects[ i ].position;
        // const p2 = this.controlObjects[ i + 1 ].position;

        // const t1Pos = this.controlPointPositions[ this.controlObjects.length + i * 2 + 0 ];
        // const t2Pos = this.controlPointPositions[ this.controlObjects.length + ( i + 1 ) * 2 + 1 ];

        // const t1 = new Vector3().subVectors( t1Pos, p1 ).multiplyScalar( PARACUBICFACTOR );
        // const t2 = new Vector3().subVectors( p2, t2Pos ).multiplyScalar( PARACUBICFACTOR );

        // const s = t, s2 = s * s, s3 = s2 * s;

        // const h1 = new Vector3().setScalar( 2 * s3 - 3 * s2 + 1 ).multiply( p1 );

        // const h2 = new Vector3().setScalar( -2 * s3 + 3 * s2 ).multiply( p2 );

        // const h3 = new Vector3().setScalar( s3 - 2 * s2 + s ).multiply( t1 );

        // const h4 = new Vector3().setScalar( s3 - s2 ).multiply( t2 );

        // retpoint.copy( h1 ).add( h2 ).add( h3 ).add( h4 );

        // return retpoint;

    }

    getSegmentLength ( i: number ): number {

        const p1 = new Vector2( this.controlObjects[ i ].position.x, this.controlObjects[ i ].position.y );
        const p2 = new Vector2( this.controlObjects[ i + 1 ].position.x, this.controlObjects[ i + 1 ].position.y );

        const hdg1 = this.hdgs[ i ];
        const hdg2 = this.hdgs[ i + 1 ];

        const dir1 = new Vector2( Math.cos( hdg1[ 0 ] ), Math.sin( hdg1[ 0 ] ) );
        const dir2 = new Vector2( Math.cos( hdg2[ 0 ] ), Math.sin( hdg2[ 0 ] ) );

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

        const x = p1.x;
        const y = p1.y;

        const hdg = hdg1[ 0 ];

        const t1 = new Vector2( 1, 0 ).multiplyScalar( PARACUBICFACTOR * this.hdgs[ i ][ 1 ] );
        const t2 = new Vector2( dir2proj.x, dir2proj.y ).multiplyScalar( PARACUBICFACTOR * this.hdgs[ i + 1 ][ 2 ] );

        const hs = HermiteSpline( new Vector2( 0, 0 ), p2proj, t1, t2 );
        const length = Length( hs, 0.001 );

        return length;
    }

    getLength (): number {

        let totalLength = 0;

        for ( let i = 0; i < this.segments.length; i++ ) {

            const length = this.getSegmentLength( i );

            totalLength += length;

        }

        return totalLength;
    }

    getLengths ( divisions ) {

        const cache = [];
        let current, last = this.getPoint( 0 );
        let sum = 0;

        cache.push( 0 );

        for ( let p = 1; p <= divisions; p++ ) {

            current = this.getPoint( p / divisions );
            sum += current.distanceTo( last );
            cache.push( sum );
            last = current;

        }

        return cache;

        // const lenghts = [];

        // lenghts.push( 0 );

        // for ( let i = 0; i < this.segments.length; i++ ) {

        //     lenghts.push( this.getSegmentLength( i ) );

        // }

        // return lenghts;
    }
}
