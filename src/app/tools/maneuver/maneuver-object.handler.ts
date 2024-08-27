/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseObjectHandler } from "../../core/object-handlers/base-object-handler";
import { ManeuverMesh } from 'app/services/junction/maneuver-mesh';
import { ConnectionService } from "app/map/junction/connection.service";
import { Log } from "app/core/utils/log";

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverObjectHandler extends BaseObjectHandler<ManeuverMesh> {

	constructor (
		private connectionService: ConnectionService
	) {
		super();
	}

	onAdded ( object: ManeuverMesh ): void {

		this.connectionService.addLink( object.junction, object.connection, object.link );

	}

	onUpdated ( object: ManeuverMesh ): void {

		Log.info( 'Maneuver updated' );

	}

	onRemoved ( object: ManeuverMesh ): void {

		this.connectionService.removeLink( object.junction, object.connection, object.link );

	}

	onDrag ( object: ManeuverMesh ): void {

		//

	}

	onDragEnd ( object: ManeuverMesh ): void {

		//

	}

}
