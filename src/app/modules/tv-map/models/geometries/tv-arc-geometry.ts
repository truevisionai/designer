/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvGeometryType } from '../tv-common';
import { Curve, Object3D, SplineCurve, Vector2, Vector3 } from 'three';
import { TvPosTheta } from '../tv-pos-theta';
import { Maths } from '../../../../utils/maths';
import { TvAbstractRoadGeometry } from './tv-abstract-road-geometry';

export class TvArcGeometry extends TvAbstractRoadGeometry {

    public attr_curvature;

    public cp1: Object3D;
    public cp2: Object3D;
    public cp3: Object3D;

    private curve: Curve<Vector2>;

    constructor ( s: number, x: number, y: number, hdg: number, length: number, curvature: number ) {

        super( s, x, y, hdg, length );

        this._geometryType = TvGeometryType.ARC;

        if ( curvature == 0 ) {
            this.attr_curvature = Maths.Epsilon;
        } else {
            this.attr_curvature = curvature;
        }

        this.computeVars();
    }

    get curvature (): number {
        return this.attr_curvature;
    }

    set curvature ( value: number ) {

        this.attr_curvature = value;

        this.computeVars();

    }

    get radius (): number {

        return 1.0 / Math.abs( this.attr_curvature );

    }

    get centre (): Vector3 {

        const clockwise = this.attr_curvature < 0;

        const circleX = this.x - this.radius * Math.cos( this.hdg - Maths.M_PI_2 ) * ( clockwise ? -1 : 1 );
        const circleY = this.y - this.radius * Math.sin( this.hdg - Maths.M_PI_2 ) * ( clockwise ? -1 : 1 );

        return new Vector3( circleX, circleY, 0 );
    }

    get startV3 (): Vector3 {

        return new Vector3( this.x, this.y, 0 );

    }

    get middleV3 (): Vector3 {

        const pos = new TvPosTheta();

        this.getCoords( this.s2 / 2, pos );

        return pos.toVector3();
    }

    get endV3 (): Vector3 {

        const pos = new TvPosTheta();

        this.getCoords( this.s2, pos );

        return pos.toVector3();

    }

    get headingEnd (): Vector3 {

        // find the end of the chord line
        const x = this.attr_x + Math.cos( this.attr_hdg ) * this.s2;
        const y = this.attr_y + Math.sin( this.attr_hdg ) * this.s2;

        return new Vector3( x, y, 0 );

    }

    updateControlPoints () {

        if ( this.cp1 ) this.cp1.position.copy( this.startV3 );
        if ( this.cp2 ) this.cp2.position.copy( this.middleV3 );
        if ( this.cp3 ) this.cp3.position.copy( this.endV3 );

    }

    getCoords ( s, odPosTheta: TvPosTheta ) {

        // calculate the first geometry element for the returning geometries
        var ds = s - this.s;
        var curvature = this.curvature;
        var theta = ds * curvature;
        var radius = 1 / Math.abs( this.curvature );
        var rotation = this.hdg - Math.sign( curvature ) * Math.PI / 2;

        const retX = this.x - radius * Math.cos( rotation ) + radius * Math.cos( rotation + theta );
        const retY = this.y - radius * Math.sin( rotation ) + radius * Math.sin( rotation + theta );

        odPosTheta.x = retX;
        odPosTheta.y = retY;
        odPosTheta.hdg = this.hdg + theta;

        return this.geometryType;
    }

    computeVars () {

        this._s2 = this.s + this.length;

        // this.startAngle = this.hdg;
        //
        // this.radius = 0.0;
        //
        // // if curvature is 0, radius is also 0, otherwise, radius is 1/curvature
        // if ( Math.abs( this.attr_curvature ) > 1.00e-15 ) {
        //
        //     // radius = Math.abs( 1.0 / this.attr_curvature );
        //
        //     this.radius = 1.0 / Math.abs( this.attr_curvature );
        //
        // }

        // this.clockwise = this.attr_curvature < 0;
        //
        // this.arcAngle = this.length * this.curvature;
        //
        // this.circleX = this.x - this.radius * Math.cos( this.startAngle - Maths.M_PI_2 ) * (this.clockwise ? -1 : 1);
        // this.circleY = this.y - this.radius * Math.sin( this.startAngle - Maths.M_PI_2 ) * (this.clockwise ? -1 : 1);

        // // calculate the start angle for the arc plot
        // // if ( this.attr_curvature <= 0 ) {
        // if ( this.attr_curvature < 0 ) {
        //
        //     this.startAngle = this.attr_hdg + Maths.M_PI_2;
        //
        // } else {
        //
        //     this.startAngle = this.attr_hdg - Maths.M_PI_2;
        //
        // }
        //
        // const cos = Math.cos( this.startAngle - Maths.M_PI );
        // const sin = Math.sin( this.startAngle - Maths.M_PI );
        //
        // this.circleX = this.attr_x + cos * this.radius;
        // this.circleY = this.attr_y + sin * this.radius;
    }

    findS ( x, y ) {

        // not working just for reference

        // // calculate the first geometry element for the returning geometries
        // //  var ds = s - this.s;
        // var curvature = this.curvature;
        // // var theta = ds * curvature;
        // var radius = 1 / Math.abs( this.curvature );
        // var rotation = this.hdg - Math.sign( curvature ) * Math.PI / 2;

        // let c = ( ( x - this.x ) + ( radius * Math.cos( rotation ) ) ) / radius;
        // let a = Math.cos( rotation );
        // let b = Math.sin( rotation );

        // let alphaCos = Math.acos( a / ( Math.sqrt( a * a + b * b ) ) );     // positive
        // let alphaSin = Math.asin( b / ( Math.sqrt( a * a + b * b ) ) );     // negative

        // let thetaCos = Math.asin( c / ( Math.sqrt( a * a + b * b ) ) ) - alphaCos;
        // let thetaSin = Math.asin( c / ( Math.sqrt( a * a + b * b ) ) ) - alphaSin;

        // let thetaNew = Math.asin( c / ( Math.sqrt( a * a + b * b ) ) );

        // let theta = x * this.curvature;

        // let thetaCosCorrect = Maths.approxEquals( theta, thetaCos );
        // let thetaSinCorrect = Maths.approxEquals( theta, thetaSin );
        // let thetaNewCorrect = Maths.approxEquals( theta, thetaNew );

        // let actualS = theta / curvature;
        // let cosS = theta / curvature;
        // let sinS = theta / curvature;
        // let foundS = thetaNew / curvature;

        // let foundSCorrect = Maths.approxEquals( actualS, foundS );

    }

    getCurve (): Curve<Vector2> {

        if ( this.curve != null ) return this.curve;

        const points: Vector2[] = [];
        const posTheta = new TvPosTheta();

        for ( let sCoordinate = this.s; sCoordinate <= this.s2; sCoordinate++ ) {

            this.getCoords( sCoordinate, posTheta );
            points.push( posTheta.toVector2() );

        }

        this.getCoords( this.s2 - Maths.Epsilon, posTheta );
        points.push( posTheta.toVector2() );

        return this.curve = new SplineCurve( points );
    }

    // getCoords ( sCheck, odPosTheta: OdPosTheta ) {
    // // s from the beginning of the segment
    // const currentLength = sCheck - this.attr_S;
    // let endAngle = this.startAngle;
    // let radius = 0.0;
    //
    // let retX, retY, retHdg;
    //
    // // if curvature is 0, radius is also 0, so don't add anything to the initial radius,
    // // otherwise, radius is 1/curvature so the central angle can be calculated and added to the initial direction
    // if ( Math.abs( this.attr_curvature ) > 1.00e-15 ) {
    //
    //     endAngle += currentLength / (1.0 / this.attr_curvature);
    //
    //     radius = Math.abs( 1.0 / this.attr_curvature );
    //
    // }
    //
    // const cos = Math.cos( endAngle );
    // const sin = Math.sin( endAngle );
    //
    // retX = this.circleX + cos * radius;
    // retY = this.circleY + sin * radius;
    //
    //
    // // heading at the given position
    // if ( this.attr_curvature <= 0 ) {
    //
    //     retHdg = endAngle - Maths.M_PI_2;
    //
    // } else {
    //
    //     retHdg = endAngle + Maths.M_PI_2;
    //
    // }
    //
    // // // tangent to arc (road direction)
    // // const theta = this.clockwise ? this.startAngle - sCheck / this.radius : this.startAngle + sCheck / this.radius;
    // //
    // // // angle arc subtends at center
    // // const arcTheta = theta - Maths.M_PI_2;11
    // //
    // // const cos = Math.cos( theta );
    // // const sin = Math.sin( theta );
    // //
    // // // lateralOffset is perpendicular to road
    // // // NA
    // // const r = this.radius - 0 * (this.clockwise ? -1 : 1);
    // //
    // // odPosTheta.x = this.circleX + r * Math.cos( arcTheta ) * (this.clockwise ? -1 : 1);
    // //
    // // odPosTheta.y = this.circleY + r * Math.sin( arcTheta ) * (this.clockwise ? -1 : 1);
    // //
    // // odPosTheta.hdg =

    setAll ( s: number, x: number, y: number, hdg: number, length: number, curvature: number ) {

        this.setBase( s, x, y, hdg, length, false );

        this.attr_curvature = curvature;

        this.computeVars();

    }

}
