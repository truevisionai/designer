/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { XmlElement } from '../../../tv-map/services/open-drive-parser.service';
import { Position } from '../position';
import { OrientationType, PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';

export class RelativeObjectPosition extends Position {

	public readonly label: string = 'Relative Object Position';
	public readonly type = PositionType.RelativeObject;

	constructor (
		public entityRef: string,
		public dx = 0,
		public dy = 0,
		public dz = 0,
		public orientation: Orientation = new Orientation()
	) {
		super();
	}

	toVector3 (): Vector3 {

		// Retrieve the position of the referenced object
		const relPos = this.entityRef ? this.getEntity( this.entityRef ).getCurrentPosition() : new Vector3();

		// Convert the orientation to radians
		const yaw = this.orientation.h * Math.PI / 180;

		// Apply rotation matrix to the offse
		const rotatedX = relPos.x + this.dx * Math.cos( yaw ) - this.dy * Math.sin( yaw );
		const rotatedY = relPos.y + this.dy * Math.cos( yaw ) + this.dx * Math.sin( yaw );
		const rotatedZ = relPos.z + this.dz;

		// Calculate the relative position vector
		return new Vector3(
			rotatedX,
			rotatedY,
			rotatedZ
		);
	}

	toOrientation (): Orientation {

		// Check if the orientation is relative
		if ( this.entityRef && this.orientation.type == OrientationType.relative ) {

			// Retrieve the orientation of the referenced object
			const objectOrientation = this.getEntity( this.entityRef ).getOrientation();

			// Calculate the relative orientation
			const relativeOrientation = new Orientation(
				objectOrientation.h + this.orientation.h,
				objectOrientation.p + this.orientation.p,
				objectOrientation.r + this.orientation.r
			);

			return relativeOrientation;

		} else {
			// The orientation is absolute, so return it as is
			return this.orientation;
		}
	}

	// // Helper function to rotate the offset based on the object's orientation
	// private rotateOffset ( dx: number, dy: number, dz: number, orientation: Orientation ): Vector3 {

	// 	// Convert the orientation to radians
	// 	const yawRad = orientation.h * Math.PI / 180;
	// 	const pitchRad = orientation.p * Math.PI / 180;
	// 	const rollRad = orientation.r * Math.PI / 180;

	// 	// Apply rotation matrix to the offset
	// 	const rotatedX = dx * Math.cos( yawRad ) - dy * Math.sin( yawRad );
	// 	const rotatedY = dx * Math.sin( yawRad ) + dy * Math.cos( yawRad );
	// 	const rotatedZ = dz;

	// 	return new Vector3( rotatedX, rotatedY, rotatedZ );
	// }

	toXML (): XmlElement {
		return {
			RelativeObject: {
				attr_object: this.entityRef,
				attr_dx: this.dx,
				attr_dy: this.dy,
				attr_dz: this.dz ? this.dz : 0,
				Orientation: this.orientation.toXML()
			}
		};
	}


}
