/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SerializedAction, SerializedField } from "../../core/components/serialization";
import { CommandHistory } from "../../services/command-history";
import { RemoveObjectCommand } from "../../commands/remove-object-command";
import { ManeuverMesh } from "app/services/junction/junction.debug";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { Vector2 } from "three";

export class ManeuverInspector {

	constructor (
		public maneuver: ManeuverMesh,
	) {
	}

	@SerializedAction( { label: 'Delete' } )
	deleteManeuver () {
		CommandHistory.execute( new RemoveObjectCommand( this.maneuver ) );
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
