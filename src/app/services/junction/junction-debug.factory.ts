/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvJunctionConnection } from "app/map/models/connections/tv-junction-connection";
import { TvJunctionLaneLink } from "app/map/models/junctions/tv-junction-lane-link";
import { COLOR } from "app/views/shared/utils/colors.service";
import { Vector2, Vector3 } from "three";
import { ManeuverMesh } from './maneuver-mesh';
import { LanePositionService } from "../lane/lane-position.service";
import { TvLaneCoord } from "app/map/models/tv-lane-coord";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { JunctionGateLine } from "./junction-gate-line";
import { Injectable } from "@angular/core";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionDebugFactory {

	constructor () { }

	createManeuverMesh ( junction: TvJunction, connection: TvJunctionConnection, link: TvJunctionLaneLink ): ManeuverMesh {

		return ManeuverMesh.create( junction, connection, link );

	}

	updateManeuverMesh ( mesh: ManeuverMesh ): void {

		mesh.connection.getRoad().computeLaneSectionCoordinates();

		mesh.update();

	}

	createJunctionGateLine ( junction: TvJunction, coord: TvLaneCoord, color: any = COLOR.CYAN, width: number = 8 ): JunctionGateLine {

		const start = LanePositionService.instance.findLaneStartPosition( coord.road, coord.laneSection, coord.lane, coord.laneDistance );

		const end = LanePositionService.instance.findLaneEndPosition( coord.road, coord.laneSection, coord.lane, coord.laneDistance );

		const geometry = this.createLineGeometry( [ start.position, end.position ] );

		const material = this.createLineMaterial( color, width );

		return new JunctionGateLine( junction, coord, geometry, material );

	}

	createLineGeometry ( points: Vector3[] ): LineGeometry {

		return new LineGeometry().setPositions( points.flatMap( p => [ p.x, p.y, p.z ] ) );

	}

	createLineMaterial ( color: any = COLOR.CYAN, lineWidth: number = 2 ): LineMaterial {

		return new LineMaterial( {
			color: color,
			linewidth: lineWidth,
			resolution: new Vector2( window.innerWidth, window.innerHeight ),
			depthTest: false,
			depthWrite: false,
			transparent: true,
		} );

	}

}
