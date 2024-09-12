/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneDirectionHelper } from "app/map/builders/od-lane-direction-builder";
import { TvJunctionBoundaryBuilder } from "app/map/junction-boundary/tv-junction-boundary.builder";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvJunctionConnection } from "app/map/models/junctions/tv-junction-connection";
import { TvJunctionLaneLink } from "app/map/models/junctions/tv-junction-lane-link";
import { COLOR } from "app/views/shared/utils/colors.service";
import { BufferGeometry, Mesh, MeshBasicMaterial, Vector2, Vector3 } from "three";
import { GeometryUtils } from "../surface/geometry-utils";
import { ManeuverMesh } from './maneuver-mesh';
import { LanePositionService } from "../lane/lane-position.service";
import { TvLaneLocation } from "app/map/models/tv-common";
import { SceneService } from "../scene.service";
import { TvLaneCoord } from "app/map/models/tv-lane-coord";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { JunctionGateLine } from "./junction-gate-line";
import { Injectable } from "@angular/core";
import { Log } from "app/core/utils/log";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionDebugFactory {

	constructor ( private boundaryBuilder: TvJunctionBoundaryBuilder ) { }

	createJunctionMesh ( junction: TvJunction ): Mesh {

		const mesh = this.boundaryBuilder.buildViaShape( junction, junction.innerBoundary );

		( mesh.material as MeshBasicMaterial ).color.set( COLOR.CYAN );
		( mesh.material as MeshBasicMaterial ).depthTest = false;
		( mesh.material as MeshBasicMaterial ).transparent = true;
		( mesh.material as MeshBasicMaterial ).opacity = 0.2;
		( mesh.material as MeshBasicMaterial ).needsUpdate = true;

		mesh[ 'tag' ] = 'junction';

		mesh.userData.junction = junction;

		return mesh;
	}

	createManeuverMesh ( junction: TvJunction, connection: TvJunctionConnection, link: TvJunctionLaneLink ): ManeuverMesh {

		return ManeuverMesh.create( junction, connection, link );

	}

	updateManeuverMesh ( mesh: ManeuverMesh ): void {

		mesh.connection.getRoad().computeLaneSectionCoordinates();

		mesh.update();

	}

	createJunctionGateLine ( junction: TvJunction, coord: TvLaneCoord, color = COLOR.CYAN, width = 8 ): JunctionGateLine {

		const start = LanePositionService.instance.findLaneStartPosition( coord.road, coord.laneSection, coord.lane, coord.s );

		const end = LanePositionService.instance.findLaneEndPosition( coord.road, coord.laneSection, coord.lane, coord.s );

		const geometry = this.createLineGeometry( [ start.position, end.position ] );

		const material = this.createLineMaterial( color, width );

		return new JunctionGateLine( junction, coord, geometry, material );

	}

	createLineGeometry ( points: Vector3[] ): LineGeometry {

		return new LineGeometry().setPositions( points.flatMap( p => [ p.x, p.y, p.z ] ) );

	}

	createLineMaterial ( color = COLOR.CYAN, lineWidth = 2 ): LineMaterial {

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
