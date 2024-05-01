import { SerializedField } from "app/core/components/serialization";
import { ManeuverMesh } from "app/services/junction/junction.debug";
import { ManeuverToolService } from "app/tools/maneuver/maneuver-tool.service";

export class ManeuverRoadInspector {

	constructor (
		private maneuverService: ManeuverToolService,
		private mesh: ManeuverMesh
	) {
	}


	@SerializedField( { type: 'float', disabled: true } )
	get length (): number {
		return this.mesh.connection.connectingRoad.length;
	}



}
