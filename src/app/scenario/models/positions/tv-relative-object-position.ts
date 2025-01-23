/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SerializedField } from 'app/core/components/serialization';
import { Vector3 } from 'app/core/maths';
import { EntityRef } from '../entity-ref';
import { Position } from '../position';
import { OpenScenarioVersion, OrientationType, PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';
import { XmlElement } from "../../../importers/xml.element";

export class RelativeObjectPosition extends Position {

	public readonly label: string = 'Relative Object Position';
	public readonly type = PositionType.RelativeObject;
	public readonly isDependent: boolean = true;

	constructor (
		public entityRef: EntityRef,
		delta: Vector3,
		orientation: Orientation = null
	) {
		super( delta || new Vector3( 0, 0, 0 ), orientation );
	}

	@SerializedField( { type: 'entity' } )
	get entityName (): string {
		return this.entityRef?.name;
	}

	set entityName ( value: string ) {
		this.entityRef.name = value;
		this.updated.emit();
	}

	@SerializedField( { type: 'vector3' } )
	get delta (): Vector3 {
		return this.vector0;
	}

	set delta ( value: Vector3 ) {
		this.vector0.copy( value );
		this.updated.emit();
	}

	@SerializedField( { type: 'vector3' } )
	get rotation (): Vector3 {
		return this.orientation.toVector3();
	}

	set rotation ( value: Vector3 ) {
		this.orientation.copyFromVector3( value );
		this.updated.emit();
	}

	getVectorPosition (): Vector3 {

		// Retrieve the position of the referenced object
		const relativePosition = this.entityRef ? this.entityRef?.entity.position.clone() : new Vector3();

		let rotatedDelta: Vector3;

		if ( this.orientation ) {

			const rotationMatrix = this.orientation.getRotationMatrix();

			rotatedDelta = this.delta.applyMatrix3( rotationMatrix );

		} else {

			rotatedDelta = this.delta.clone();

		}

		return relativePosition.add( rotatedDelta );

	}

	getOrientation (): Orientation {

		// Check if the orientation is relative
		if ( this.entityRef && this.orientation.type == OrientationType.relative ) {

			// Retrieve the orientation of the referenced object
			const refOrientation = this.entityRef?.entity.getOrientation().clone();

			// Calculate the relative orientation
			return refOrientation.add( this.orientation );

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

	toXML ( version: OpenScenarioVersion ): XmlElement {

		const key = version == OpenScenarioVersion.v0_9 ? 'RelativeObject' : 'RelativeObjectPosition';

		return {
			[ key ]: {
				attr_object: this.entityRef?.name,
				attr_dx: this.vector0.x,
				attr_dy: this.vector0.y,
				attr_dz: this.vector0.z,
				Orientation: this.orientation?.toXML()
			}
		};
	}

	updateFromWorldPosition ( position: Vector3, orientation: Orientation ): void {

		const entityPosition = this.entityRef.entity.position.clone();

		const delta = position.clone().sub( entityPosition );

		this.vector0.copy( delta );

		this.orientation.copy( orientation );

		this.updated.emit();

	}

}
