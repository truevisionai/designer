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

	constructor (
		public x = 0,
		public y = 0,
		public z = 0,
		public h = 0,
		public p = 0,
		public r = 0
	) {

		super();

		this.updateVector3();

	}

	get position (): Vector3 {

		return new Vector3( this.x, this.y, this.z );

	}

	// set position ( value: Vector3 ) {

	// 	this.x = value.x;
	// 	this.y = value.y;
	// 	this.z = value.z;

	// }

	get rotation (): Vector3 {

		return new Vector3( this.h, this.p, this.r );

	}

	get rotationInDegree (): Vector3 {

		return new Vector3(
			this.h * MathUtils.RAD2DEG,
			this.p * MathUtils.RAD2DEG,
			this.r * MathUtils.RAD2DEG
		);

	}

	// set rotation ( value: Vector3 ) {

	// 	this.h = value.x;
	// 	this.p = value.y;
	// 	this.r = value.z;

	// }

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

		return {
			World: {
				attr_x: this.vector3?.x ?? 0,
				attr_y: this.vector3?.y ?? 0,
				attr_z: this.vector3?.z ?? 0,
				attr_h: this.h ?? 0,
				attr_p: this.p ?? 0,
				attr_r: this.r ?? 0,
			}
		};
	}
}
