/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { ManeuverMesh } from 'app/services/junction/maneuver-mesh';
import { ConnectionService } from "app/map/junction/connection.service";
import { ManeuverInspector } from "./maneuver.inspector";
import { EmptyController } from "app/core/object-handlers/empty-controller";
import { ManeuverSignalizationInspector } from "../traffic-light/maneuver-signalization.inspector";

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverToolManeuverMeshController extends EmptyController<ManeuverMesh> {

	constructor (
		private connectionService: ConnectionService
	) {
		super();
	}

	showInspector ( object: ManeuverMesh ): void {

		this.setInspector( new ManeuverInspector( object ) );

	}

	// onAdded ( object: ManeuverMesh ): void {

	// 	this.connectionService.addLink( object.junction, object.connection, object.link );

	// }

	// onRemoved ( object: ManeuverMesh ): void {

	// 	this.connectionService.removeLink( object.junction, object.connection, object.link );

	// }

}


@Injectable( {
	providedIn: 'root'
} )
export class TrafficLightManeuverMeshController extends EmptyController<ManeuverMesh> {

	showInspector ( object: ManeuverMesh ): void {

		this.setInspector( new ManeuverSignalizationInspector( object ) );

	}

}
