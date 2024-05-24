/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseDebugger } from "../../core/interfaces/base-debugger";
import { ManeuverMesh } from "../../services/junction/junction.debug";
import { DebugState } from "../../services/debug/debug-state";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionManeuverDebugger extends BaseDebugger<ManeuverMesh> {

	constructor () {
		super();
	}

	setDebugState ( object: ManeuverMesh, state: DebugState ): void {

		this.setBaseState( object, state );

	}

	onHighlight ( object: ManeuverMesh ): void {

		//

	}

	onUnhighlight ( object: ManeuverMesh ): void {

		//

	}

	onSelected ( object: ManeuverMesh ): void {

		//

	}

	onUnselected ( object: ManeuverMesh ): void {

		//

	}

	onDefault ( object: ManeuverMesh ): void {

		//

	}

	onRemoved ( object: ManeuverMesh ): void {

		//

	}
}