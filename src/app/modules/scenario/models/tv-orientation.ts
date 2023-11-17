/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Maths } from 'app/utils/maths';
import { Euler, Matrix3, Vector3 } from 'three';
import { OpenScenarioVersion, OrientationType } from './tv-enums';
import { XmlElement } from "../../../importers/xml.element";

/**
 * Orientation defined in terms of heading, pitch, roll angles.
 * heading is the rotation around the z-axis, pitch is the rotation around the y-axis,
 * and roll is the rotation around the x-axis.
 * Assumed the positive rotation to be counter-clockwise.
 *
 * h=0 means the object is facing towards the positive x-axis .i.e towards east
 * h=1.5 means the object is facing towards the positive y-axis .i.e towards north
 * h=3 means the object is facing towards the negative x-axis .i.e towards west
 * h is in radians and in the range of 0 to 2PI (0 to 360 degrees)
 * h is positive in the counter-clockwise direction
 *
 * positive value means a counter-clockwise shift in both threejs and open scenario
 *
 *
 */
export class Orientation {

	private euler: Euler;

	constructor (
		h: number = 0,
		p: number = 0,
		r: number = 0,
		public type: OrientationType = OrientationType.absolute
	) {
		this.euler = new Euler( r, p, h - Maths.M_PI_2 );
	}

	get h () {
		return this.euler.z;
	}

	set h ( value: number ) {
		this.euler.z = value;
	}

	get p () {
		return this.euler.y;
	}

	set p ( value: number ) {
		this.euler.y = value;
	}

	get r () {
		return this.euler.x;
	}

	set r ( value: number ) {
		this.euler.x = value;
	}

	static fromXML ( xml: XmlElement ): Orientation {

		if ( !xml ) return null;

		const h: number = parseFloat( xml?.attr_h || 0 );
		const p: number = parseFloat( xml?.attr_p || 0 );
		const r: number = parseFloat( xml?.attr_r || 0 );

		let type: OrientationType = OrientationType.absolute;

		if ( xml?.attr_type && xml?.attr_type === OrientationType.relative ) {
			type = OrientationType.relative;
		}

		return new Orientation( h, p, r, type );
	}

	toXML ( version?: OpenScenarioVersion ) {
		return {
			attr_h: this.h + Maths.M_PI_2 ?? 0,
			attr_p: this.p ?? 0,
			attr_r: this.r ?? 0,
			attr_type: this.type
		};
	}

	toEuler (): Euler {
		return this.euler;
	}

	toVector3 (): Vector3 {
		return new Vector3( this.h, this.p, this.r );
	}

	clone (): Orientation {
		return new Orientation( this.h, this.p, this.r, this.type );
	}

	copy ( orentation: Orientation ) {
		this.h = orentation.h;
		this.p = orentation.p;
		this.r = orentation.r;
		this.type = orentation.type;
	}

	copyFromVector3 ( value: Vector3 ) {
		this.h = value.x;
		this.p = value.y;
		this.r = value.z;
	}

	getRelativeOrientation ( orientation: Orientation ): Orientation {

		return new Orientation(
			this.h + orientation.h,
			this.p + orientation.p,
			this.r + orientation.r,
			OrientationType.relative
		);
	}

	getRotationMatrix (): Matrix3 {

		const cosR = Math.cos( this.r );
		const sinR = Math.sin( this.r );
		const cosP = Math.cos( this.p );
		const sinP = Math.sin( this.p );
		const cosH = Math.cos( this.h );
		const sinH = Math.sin( this.h );

		// Compute individual matrices
		const rollMatrix = new Matrix3().set(
			1, 0, 0,
			0, cosR, -sinR,
			0, sinR, cosR
		);

		const pitchMatrix = new Matrix3().set(
			cosP, 0, sinP,
			0, 1, 0,
			-sinP, 0, cosP
		);

		const yawMatrix = new Matrix3().set(
			cosH, -sinH, 0,
			sinH, cosH, 0,
			0, 0, 1
		);

		// Multiply matrices together
		// Assuming Matrix3x3 has a multiply method
		return yawMatrix.multiply( pitchMatrix.multiply( rollMatrix ) );

	}

	add ( relativeOrientation: Orientation ) {

		this.h += relativeOrientation.h;
		this.p += relativeOrientation.p;
		this.r += relativeOrientation.r;

		return this;
	}

	isNotEmpty () {
		return this.h != 0 && this.p != 0 && this.r != 0;
	}
}

