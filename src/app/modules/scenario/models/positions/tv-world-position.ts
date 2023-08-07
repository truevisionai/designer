/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Euler, MathUtils, Vector3 } from 'three';
import { Position } from '../position';
import { OpenScenarioVersion, PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';
import { Maths } from 'app/utils/maths';

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

		return new Vector3( this.r, this.p, this.h );

	}

	get rotationInDegree (): Vector3 {

		return new Vector3(
			this.r * MathUtils.RAD2DEG,
			this.p * MathUtils.RAD2DEG,
			this.h * MathUtils.RAD2DEG,
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

		return new Euler( this.r, this.p, this.h, 'ZXY' );

	}

	toOrientation (): Orientation {

		return new Orientation( this.r, this.p, this.h );

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

	toXML ( version: OpenScenarioVersion ) {

		const key = version == OpenScenarioVersion.v0_9 ?
			'World' :
			'WorldPosition';

		return {
			[ key ]: {
				attr_x: this.vector3?.x ?? 0,
				attr_y: this.vector3?.y ?? 0,
				attr_z: this.vector3?.z ?? 0,
				attr_h: this.h + Maths.M_PI_2 ?? 0,
				attr_p: this.p ?? 0,
				attr_r: this.r ?? 0,
			}
		};
	}
}
