/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { ManeuverMesh } from 'app/services/junction/maneuver-mesh';
import { ConnectionService } from "app/map/junction/connection.service";
import { ManeuverInspector } from "../maneuver.inspector";
import { EmptyController } from "app/core/controllers/empty-controller";

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

	onAdded ( object: ManeuverMesh ): void {

		this.connectionService.addConnection( object.junction, object.connection );

	}

	onRemoved ( object: ManeuverMesh ): void {

		this.connectionService.removeConnection( object.junction, object.connection );

	}

	onUpdated ( object: ManeuverMesh ): void {

		// this.connectionService.updateLink( object.junction, object.connection, object.link );

	}

}


