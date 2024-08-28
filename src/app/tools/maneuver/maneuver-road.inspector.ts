/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SerializedField } from "app/core/components/serialization";
import { ManeuverMesh } from "app/services/junction/maneuver-mesh";
import { ManeuverToolHelper } from "app/tools/maneuver/maneuver-tool-helper.service";

export class ManeuverRoadInspector {

	constructor (
		private maneuverService: ManeuverToolHelper,
		private mesh: ManeuverMesh
	) {
	}


	@SerializedField( { type: 'float', disabled: true } )
	get length (): number {
		return this.mesh.connection.connectingRoad.length;
	}



}
