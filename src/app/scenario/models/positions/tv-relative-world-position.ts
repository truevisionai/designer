/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SerializedField } from 'app/core/components/serialization';
import { Euler, Vector3 } from 'three';
import { EntityRef } from '../entity-ref';
import { Position } from '../position';
import { OpenScenarioVersion, OrientationType, PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';
import { XmlElement } from "../../../importers/xml.element";

/**
 * Position defined in terms of delta x, y, (z) relative to a reference entity's
 * position in world coordinate space. Optionally, an orientation can be
 * defined in either absolute or relative values.
 *
 */
export class RelativeWorldPosition extends Position {

	public readonly label: string = 'Relative World Position';
	public readonly type = PositionType.RelativeWorld;
	public readonly isDependent: boolean = true;

	/**
	 * The absolute reference context refers to the orientation with respect to
	 * the World coordinate system (i.e., the orientation of the reference entity is ignored).
	 *
	 * The relative reference context refers to the angular shift of orientation angles with
	 * respect to the corresponding orientation angles of the reference entity in the World
	 * coordinate system. The positive value means a counter-clockwise shift.
	 *
	 * Missing Orientation property is interpreted as the absolute
	 * reference context with Heading=Pitch=Roll=0.
	 */

	/**
	 *
	 * @param entityRef
	 * @param delta
	 * @param orientation
	 */
	constructor (
		public entityRef: EntityRef,
		delta: Vector3,
		orientation?: Orientation
	) {
		super( delta || new Vector3( 0, 0, 0 ), orientation || new Orientation( 0, 0, 0, OrientationType.absolute ) );
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

	static fromXML ( xml: XmlElement ): RelativeWorldPosition {

		const entity: string = xml?.attr_object || xml?.attr_entity || xml?.attr_entityRef;

		const dx = parseFloat( xml?.attr_dx || 0 );
		const dy = parseFloat( xml?.attr_dy || 0 );
		const dz = parseFloat( xml?.attr_dz || 0 );

		const orientation = Orientation.fromXML( xml?.Orientation );

		return new RelativeWorldPosition( new EntityRef( entity ), new Vector3( dx, dy, dz ), orientation );
	}

	toXML ( version?: OpenScenarioVersion ): any {

		return {
			attr_entityRef: this.entityRef?.name,
			attr_dx: this.delta.x,
			attr_dy: this.delta.y,
			attr_dz: this.delta.z,
			Orientation: this.orientation?.toXML(),
		};

	}

	getVectorPosition (): Vector3 {

		// Retrieve the position of the referenced entity
		// const entityPosition = this.entityRef ? this.getEntity( this.entityRef ).getCurrentPosition() : new Vector3();
		const entityPosition = this.entityRef.entity.position.clone();

		// Calculate the relative position vector
		return entityPosition.add( this.delta );
	}

	toEuler (): Euler {

		if ( !this.entityRef ) return this.orientation?.toEuler();

		if ( !this.orientation ) return this.orientation?.toEuler();

		if ( this.orientation.type == OrientationType.absolute ) {

			return this.orientation.toEuler();

		}

		const refOrientation = this.entityRef.entity.getOrientation().clone();

		return refOrientation.add( this.orientation ).toEuler();

	}

	updateFromWorldPosition ( position: Vector3, orientation: Orientation ): void {

		const entityPosition = this.entityRef.entity.position.clone();

		const delta = position.clone().sub( entityPosition );

		this.vector0.copy( delta );

		this.orientation.copy( orientation );

		this.updated.emit();

	}

}
