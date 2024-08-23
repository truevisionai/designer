/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SerializedAction, SerializedField } from "../../core/components/serialization";
import { ManeuverMesh } from 'app/services/junction/maneuver-mesh';
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { Vector2 } from "three";
import { Commands } from "app/commands/commands";

export class ManeuverInspector {

	constructor (
		public maneuver: ManeuverMesh,
	) {
	}

	@SerializedAction( { label: 'Delete' } )
	deleteManeuver () {
		Commands.RemoveObject( this.maneuver );
	}

}


export class ManeuverControlPointInspector {

	constructor (
		public point: AbstractControlPoint
	) {
	}

	@SerializedField( { type: 'vector2' } )
	get position (): Vector2 {
		return new Vector2( this.point.position.x, this.point.position.y );
	}

	set position ( value: Vector2 ) {
		this.point.position.x = value.x;
		this.point.position.y = value.y;
	}

	// @SerializedAction( { label: 'Delete' } )
	// deleteManeuver () {
	// 	CommandHistory.execute( new RemoveObjectCommand( this.point ) );
	// }

}
