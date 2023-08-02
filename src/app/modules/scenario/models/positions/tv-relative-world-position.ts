/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Euler, Vector3 } from 'three';
import { Position } from '../position';
import { OpenScenarioVersion, OrientationType, PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';
import { XmlElement } from 'app/modules/tv-map/services/open-drive-parser.service';

export class RelativeWorldPosition extends Position {

	public readonly label: string = 'Relative World Position';
	public readonly type = PositionType.RelativeWorld;

	constructor (
		public entityRef: string,
		public dx: number = 0,
		public dy: number = 0,
		public dz: number = 0,
		public orientation: Orientation = null
	) {
		super();
	}

	toXML ( version?: OpenScenarioVersion ) {

		return {
			attr_entityRef: this.entityRef,
			attr_dx: this.dx,
			attr_dy: this.dy,
			attr_dz: this.dz,
			Orientation: this.orientation?.toXML(),
		}

	}

	static fromXML ( xml: XmlElement ): RelativeWorldPosition {

		const entity: string = xml?.attr_object || xml?.attr_entity || xml?.attr_entityRef;

		const dx = parseFloat( xml?.attr_dx || 0 );
		const dy = parseFloat( xml?.attr_dy || 0 );
		const dz = parseFloat( xml?.attr_dz || 0 );

		const orientation = Orientation.fromXML( xml?.Orientation );

		return new RelativeWorldPosition( entity, dx, dy, dz, orientation );
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

		if ( !this.entityRef || this.orientation.type == OrientationType.absolute ) {

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
