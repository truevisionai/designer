/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SerializedField } from "../../core/components/serialization";
import { ManeuverMesh } from "../../services/junction/junction.debug";

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
