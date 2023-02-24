/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

// Class representing a position in space plus a direction.
import { Vector2, Vector3 } from 'three';
import { Maths } from '../../../utils/maths';

export class TvPosTheta {

    constructor ( x?: number, y?: number, hdg?: number, s?: number, t?: number ) {
        this._x = x;
        this._y = y;
        this._hdg = hdg;
        this._s = s;
        this._t = t;
    }

    private _x: number;

    get x () {
        return this._x;
    }

    set x ( value ) {
        this._x = value;
    }

    private _s: number;

    get s () {
        return this._s;
    }

    set s ( value ) {
        this._s = value;
    }

    private _t: number;

    get t () {
        return this._t;
    }

    set t ( value ) {
        this._t = value;
    }

    private _y: number;

    get y () {
        return this._y;
    }

    set y ( value ) {
        this._y = value;
    }

    private _hdg: number;

    get hdg () {
        return this._hdg;
    }

    set hdg ( value ) {
        this._hdg = value;
    }

    toVector3 (): Vector3 {
        return new Vector3( this.x, this.y, 0 );
    }

    toVector2 (): Vector2 {
        return new Vector2( this.x, this.y );
    }

    toDirectionVector (): Vector3 {

        const direction = new Vector3();

        direction.x = Math.cos( this.hdg ) * Math.cos( 0 );
        direction.y = Math.sin( this.hdg ) * Math.cos( 0 );
        direction.z = 0; // Math.sin( pose.hdg );

        return direction;
    }

    rotateDegree ( degree: number ) {

        this.hdg = this.hdg + Maths.Deg2Rad * degree;

        return this;
    }

    rotateRadian ( radians: number ) {

        this.hdg = this.hdg + radians;

        return this;
    }

    moveForward ( s: number ): TvPosTheta {

        const x = this.x + Math.cos( this.hdg ) * s;
        const y = this.y + Math.sin( this.hdg ) * s;

        return this.clone( x, y, this.hdg, this.s + s, this.t );
    }

    // offset means t
    addLateralOffset ( offset: number ) {

        // // find the end of the chord line
        // this.x = this.x + Math.cos( this.hdg ) * laneOffset;
        // this.y = this.y + Math.sin( this.hdg ) * laneOffset;

        // // cosine and sine for the tangent (lateral position in track coords)
        // double cosHdgPlusPiO2 = -1 * Math.Cos(hdg + OpenDriveXmlParserV2.M_PI_2);
        // double sinHdgPlusPiO2 = -1 * Math.Sin(hdg + OpenDriveXmlParserV2.M_PI_2);
        //
        // x += cosHdgPlusPiO2 * (cumulativeWidth + 0);
        // y += sinHdgPlusPiO2 * (cumulativeWidth + 0);

        // changed after testing
        // let cosHdgPlusPiO2 = -1 * Math.cos( this.hdg + Maths.M_PI_2 );
        // let sinHdgPlusPiO2 = -1 * Math.sin( this.hdg + Maths.M_PI_2 );

        let cosHdgPlusPiO2 = Math.cos( this.hdg + Maths.M_PI_2 );
        let sinHdgPlusPiO2 = Math.sin( this.hdg + Maths.M_PI_2 );

        this.x += cosHdgPlusPiO2 * ( offset );
        this.y += sinHdgPlusPiO2 * ( offset );

        return this;
    }

    clone ( x?: number, y?: number, hdg?: number, s?: number, t?: number ) {

        return new TvPosTheta( x || this.x, y || this.y, hdg || this.hdg, s || this.s, t || this.t );

    }
}
