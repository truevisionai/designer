/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { EmptyController } from "../../../core/object-handlers/empty-controller";
import { ManeuverMesh } from "../../../services/junction/maneuver-mesh";
import { ManeuverSignalizationInspector } from "../maneuver-signalization.inspector";

@Injectable( {
	providedIn: 'root'
} )
export class TrafficLightManeuverMeshController extends EmptyController<ManeuverMesh> {

	showInspector ( object: ManeuverMesh ): void {

		this.setInspector( new ManeuverSignalizationInspector( object ) );

	}

}