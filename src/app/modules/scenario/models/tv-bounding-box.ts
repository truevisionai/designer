/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';

export class TvDimension {

	constructor ( public width: number = 0, public length: number = 0, public height: number = 0 ) {

	}

}

export class TvBoundingBox {

	constructor ( public center: Vector3 = new Vector3(), public dimension: TvDimension = new TvDimension( 0, 0, 0 ) ) {
	}

}


export class TvPerformance {

	constructor (
		public maxSpeed: number,
		public maxAcceleration: number,
		public maxDeceleration: number,
		public mass?: number
	) {

	}

}

export class TvAxles {

	// <xsd:element name="Front" type="OSCAxle"/>
	// <xsd:element name="Rear" type="OSCAxle"/>
	// <xsd:element name="Additional" type="OSCAxle" minOccurs="0" maxOccurs="unbounded"/>
	constructor (
		public front: TvAxle,
		public rear: TvAxle,
		public additional?: TvAxle[]
	) {
	}

}

export class TvAxle {

	// <xsd:attribute name="maxSteering"   type="xsd:double" use="required"/>
	// <xsd:attribute name="wheelDiameter" type="xsd:double" use="required"/>
	// <xsd:attribute name="trackWidth"    type="xsd:double" use="required"/>
	// <xsd:attribute name="positionX"     type="xsd:double" use="required"/>
	// <xsd:attribute name="positionZ"     type="xsd:double" use="required"/>
	constructor (
		public maxSteering: number,
		public wheelDiameter: number,
		public trackWidth: number,
		public positionX: number,
		public positionZ: number
	) {
	}


}
