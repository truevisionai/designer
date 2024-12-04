/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SerializedAction, SerializedField } from "../../core/components/serialization";
import { PropPolygon } from "./prop-polygon.model";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { Vector3 } from "three";
import { Commands } from "app/commands/commands";

export class PropPolygonInspector {

	constructor (
		public polygon: PropPolygon,
		public controlPoint?: AbstractControlPoint,
	) {
	}

	@SerializedField( { type: 'float', min: 0, max: 1 } )
	get density (): number {
		return this.polygon.density;
	}

	set density ( value: number ) {
		this.polygon.density = value;
	}

	@SerializedField( { type: 'vector3' } )
	get point (): Vector3 {
		return this.controlPoint?.position;
	}

	set point ( value: Vector3 ) {
		this.controlPoint?.position.copy( value );
	}

	@SerializedAction( { label: 'Delete Polygon' } )
	delete (): void {

		Commands.RemoveObject( this.polygon );

	}
}
