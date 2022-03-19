/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvGeometryType } from '../tv-common';
import { Curve, SplineCurve, Vector2, Vector3 } from 'three';
import { TvPosTheta } from '../tv-pos-theta';
import { TvAbstractRoadGeometry } from './tv-abstract-road-geometry';

export class TvPoly3Geometry extends TvAbstractRoadGeometry {

    public attr_a: number;
    public attr_b: number;
    public attr_c: number;
    public attr_d: number;

    private staringPoint;
    private sinTheta;
    private cosTheta;
    private curve: Curve<Vector2>;

    constructor ( s: number, x: number, y: number, hdg: number, length: number, a: number, b: number, c: number, d: number ) {

        super( s, x, y, hdg, length );

        this._geometryType = TvGeometryType.POLY3;

        this.attr_a = a;
        this.attr_b = b;
        this.attr_c = c;
        this.attr_d = d;

        this.computeVars();
    }

    getCoords ( sCheck: any, posTheta: TvPosTheta ) {

        const vLocal = this.getBezierValue( sCheck );

        const x = sCheck;
        const y = vLocal;

        const xnew = x * this.cosTheta - y * this.sinTheta;
        const ynew = x * this.sinTheta + y * this.cosTheta;

        // Derivate to get heading change
        const dCoeffs = (new Vector3( this.attr_b, this.attr_c, this.attr_d )).multiply( new Vector3( 1, 2, 3 ) );
        const tangent = this.polyeval( sCheck, dCoeffs );

        posTheta.x = this.x + xnew;
        posTheta.y = this.y + ynew;

        posTheta.hdg = this.hdg + tangent;

        return this.geometryType;
    }

    getCurve (): Curve<Vector2> {

        const points: Vector2[] = [];
        const posTheta = new TvPosTheta();

        for ( let sCoordinate = this.s; sCoordinate < this.s2; sCoordinate++ ) {

            this.getCoords( sCoordinate, posTheta );
            points.push( posTheta.toVector2() );

        }

        return this.curve = new SplineCurve( points );

    }

    computeVars () {


        this.sinTheta = Math.sin( this.hdg );
        this.cosTheta = Math.cos( this.hdg );


        // throw new Error("Method not implemented.");
    }

    getBezierValue ( sCheck ): number {

        const du = sCheck - this.s;

        return (this.attr_a) +
            (this.attr_b * du) +
            (this.attr_c * du * du) +
            (this.attr_d * du * du * du);
    }

}
