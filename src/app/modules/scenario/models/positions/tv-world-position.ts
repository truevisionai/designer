/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Euler, MathUtils, Vector3 } from 'three';
import { Position } from '../position';
import { PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';

export class WorldPosition extends Position {

	public readonly label: string = 'World Position';
	public readonly type = PositionType.World;

	public m_X: number = 0;
	public m_Y: number = 0;
	public m_Z: number = 0;
	public m_H: number = 0;
	public m_P: number = 0;
	public m_R: number = 0;

	constructor ( x = 0, y = 0, z = 0, h = 0, p = 0, r = 0 ) {

		super();

		this.m_X = x;
		this.m_Y = y;
		this.m_Z = z;

		this.m_H = h;
		this.m_P = p;
		this.m_R = r;

	}

	get x () {
		return this.m_X;
	}

	set x ( value ) {
		this.m_X = value;
	}

	get y () {
		return this.m_Y;
	}

	set y ( value ) {
		this.m_Y = value;
	}

	get z () {
		return this.m_Z;
	}

	set z ( value ) {
		this.m_Z = value;
	}

	get h () {
		return this.m_H;
	}

	set h ( value ) {
		this.m_H = value;
	}

	get p () {
		return this.m_P;
	}

	set p ( value ) {
		this.m_P = value;
	}

	get r () {
		return this.m_R;
	}

	set r ( value ) {
		this.m_R = value;
	}

	get position (): Vector3 {

		return new Vector3( this.m_X, this.m_Y, this.m_Z );

	}

	set position ( value: Vector3 ) {

		this.m_X = value.x;
		this.m_Y = value.y;
		this.m_Z = value.z;

	}

	get rotation (): Vector3 {

		return new Vector3( this.m_H, this.m_P, this.m_R );

	}

	get rotationInDegree (): Vector3 {

		return new Vector3(
			this.m_H * MathUtils.RAD2DEG,
			this.m_P * MathUtils.RAD2DEG,
			this.m_R * MathUtils.RAD2DEG
		);

	}

	set rotation ( value: Vector3 ) {

		this.m_H = value.x;
		this.m_P = value.y;
		this.m_R = value.z;

	}

	static createFromVector3 ( point: THREE.Vector3 ): WorldPosition {

		const worldPosition = new WorldPosition();

		worldPosition.vector3 = point;

		return worldPosition;
	}

	toVector3 (): Vector3 {

		return this.position;

	}

	toEuler (): Euler {

		return new Euler( this.h, this.p, this.r, 'XYZ' );

	}

	toOrientation (): Orientation {

		return new Orientation( this.h, this.p, this.r );

	}

	setPosition ( point: Vector3 ) {

		this.x = this.vector3.x = point.x;
		this.y = this.vector3.y = point.y;
		this.z = this.vector3.z = point.z;

	}

	updateVector3 () {

		this.vector3.x = this.x;
		this.vector3.y = this.y;
		this.vector3.z = this.z;

	}

	toXML () {

		const x = this.vector3 ? this.vector3.x : this.x;
		const y = this.vector3 ? this.vector3.y : this.y;
		const z = this.vector3 ? this.vector3.z : this.y;

		return {
			World: {
				attr_x: x,
				attr_y: y,
				attr_z: z,
				attr_h: this.m_H ? this.m_H : 0,
				attr_p: this.m_P ? this.m_P : 0,
				attr_r: this.m_R ? this.m_R : 0,
			}
		};
	}
}
