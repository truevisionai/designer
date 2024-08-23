/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SerializedField } from "../../core/components/serialization";
import { ManeuverMesh } from "app/services/junction/maneuver-mesh";

export class ManeuverSignalizationInspector {

	constructor (
		private maneuver: ManeuverMesh
	) {
	}

	// @SerializedField( { type: 'string', label: 'Turn Type' } )
	// get state () {
	// 	return 'Yield';
	// }

	// set state ( value ) {
	// 	console.log( value );
	// }
}
