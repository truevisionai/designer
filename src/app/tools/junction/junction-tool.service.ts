/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { JunctionFactory } from 'app/factories/junction.factory';
import { DebugDrawService } from 'app/services/debug/debug-draw.service';
import { ConnectionService } from 'app/map/junction/connection/connection.service';
import { JunctionMeshService } from 'app/services/junction/junction-mesh.service';
import { JunctionNodeService } from 'app/services/junction/junction-node.service';
import { JunctionService } from 'app/services/junction/junction.service';
import { LaneLinkService } from 'app/services/junction/lane-link.service';
import { MapService } from 'app/services/map/map.service';
import { RoadDividerService } from 'app/services/road/road-divider.service';
import { RoadService } from 'app/services/road/road.service';
import { BaseToolService } from '../base-tool.service';
import { MeshStandardMaterial } from 'three';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { TvContactPoint } from 'app/map/models/tv-common';
import { TvRoadLinkChildType } from 'app/map/models/tv-road-link-child';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionToolService {

	constructor (
		private junctionService: JunctionService,
		private junctionNodeService: JunctionNodeService,
		public junctionMeshService: JunctionMeshService,
		public connectionService: ConnectionService,
		public debug: DebugDrawService,
		public base: BaseToolService,
		public laneLinkService: LaneLinkService,
		public mapService: MapService,
		private roadService: RoadService,
	) { }

	addJunction ( junction: TvJunction ) {

		this.junctionService.addJunction( junction );

	}

	removeJunction ( junction: TvJunction ) {

		this.junctionService.removeJunction( junction );

	}

	removeJunctionNodes () {

		this.junctionNodeService.hideAllJunctionNodes();

	}

	showJunctionNodes () {

		this.junctionNodeService.showAllJunctionNodes();

	}

	highlightJunctionMeshes () {

		this.mapService.map.getJunctions().filter( junction => junction.mesh ).forEach( junction => {

			( junction.mesh.material as MeshStandardMaterial ).emissive.set( COLOR.RED );

		} );

	}

	hideJunctionMeshes () {

		this.mapService.map.getJunctions().filter( junction => junction.mesh ).forEach( junction => {

			( junction.mesh.material as MeshStandardMaterial ).emissive.set( COLOR.BLACK );

		} );

	}

	createJunctionFromCoords ( coords: TvRoadCoord[] ): TvJunction {

		return this.junctionService.createFromCoords( coords );

	}

	addConnectionsFromContact (
		junction: TvJunction,
		roadA: TvRoad, contactA: TvContactPoint,
		roadB: TvRoad, contactB: TvContactPoint
	): TvJunction {

		return this.junctionService.addConnectionsFromContact(
			junction,
			roadA,
			contactA,
			roadB,
			contactB
		);

	}


}
