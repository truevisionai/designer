/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Euler, Vector3 } from 'three';
import { Position } from '../position';
import { EnumOrientationType, PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';

export class RelativeWorldPosition extends Position {

	public readonly label: string = 'Relative World Position';
	public readonly type = PositionType.RelativeWorld;

	constructor (
		public entityRef: string,
		public dx: number = 0,
		public dy: number = 0,
		public dz: number = 0,
		public orientation: Orientation = new Orientation()
	) {
		super();
	}

	exportXml () {

		throw new Error( 'Method not implemented.' );

	}

	toVector3 (): Vector3 {

		// Retrieve the position of the referenced entity
		const entityPosition = this.entityRef ?
			this.getEntity( this.entityRef ).getCurrentPosition() : new Vector3();

		// Calculate the relative position vector
		const relativeVector = new Vector3(
			entityPosition.x + this.dx,
			entityPosition.y + this.dy,
			entityPosition.z + this.dz
		);

		return relativeVector;
	}

	toEuler (): Euler {

		if ( !this.entityRef || this.orientation.type == EnumOrientationType.absolute ) {

			return this.orientation.toEuler();

		}

		const entity = this.getEntity( this.entityRef );

		const entityOrientation = entity.getOrientation();

		// Calculate the relative orientation
		const relativeOrientation = new Orientation(
			entityOrientation.h + this.orientation.h,
			entityOrientation.p + this.orientation.p,
			entityOrientation.r + this.orientation.r
		);

		return relativeOrientation.toEuler();
	}

	toOrientation (): Orientation {

		return new Orientation();

	}


}
