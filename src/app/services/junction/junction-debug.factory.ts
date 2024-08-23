import { LaneDirectionHelper } from "app/map/builders/od-lane-direction-builder";
import { TvJunctionBoundaryBuilder } from "app/map/junction-boundary/tv-junction-boundary.builder";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvJunctionConnection } from "app/map/models/junctions/tv-junction-connection";
import { TvJunctionLaneLink } from "app/map/models/junctions/tv-junction-lane-link";
import { COLOR } from "app/views/shared/utils/colors.service";
import { BufferGeometry, Mesh, MeshBasicMaterial, Vector3 } from "three";
import { GeometryUtils } from "../surface/geometry-utils";
import { ManeuverMesh } from './maneuver-mesh';
import { LanePositionService } from "../lane/lane-position.service";
import { TvLaneLocation } from "app/map/models/tv-common";
import { SceneService } from "../scene.service";

export class JunctionDebugFactory {

	private static _instance: JunctionDebugFactory;

	static get instance (): JunctionDebugFactory {

		if ( !JunctionDebugFactory._instance ) {
			JunctionDebugFactory._instance = new JunctionDebugFactory();
		}

		return JunctionDebugFactory._instance;
	}

	createJunctionMesh ( junction: TvJunction ): Mesh {

		const mesh = TvJunctionBoundaryBuilder.instance.buildViaShape( junction, junction.innerBoundary );

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

		const material = new MeshBasicMaterial( {
			color: COLOR.GREEN,
			opacity: 0.2,
			transparent: true,
			depthTest: false,
			depthWrite: false
		} );

		const geometry = this.createManeuverMeshGeeometry( connection, link );

		const mesh = new ManeuverMesh( junction, connection, link, geometry, material );

		this.addArrows( mesh );

		return mesh;

	}

	addArrows ( mesh: ManeuverMesh ): void {

		const distance = mesh.connection.connectingRoad.length / 5;

		const arrows = LaneDirectionHelper.drawSingleLane( mesh.link.connectingLane, distance, 0.25 );

		arrows.forEach( arrow => mesh.add( arrow ) );

	}

	updateManeuverMesh ( mesh: ManeuverMesh ): void {

		const geometry = this.createManeuverMeshGeeometry( mesh.connection, mesh.link );

		mesh.geometry = geometry;

		SceneService.removeChildren( mesh );

		this.addArrows( mesh );

	}

	createManeuverMeshGeeometry ( connection: TvJunctionConnection, link: TvJunctionLaneLink ): BufferGeometry {

		const points = LanePositionService.instance.getLanePointsById(
			connection.connectingRoad,
			link.connectingLane.id,
			TvLaneLocation.CENTER
		);

		return GeometryUtils.createExtrudeGeometry( points.map( p => p.position ) );
	}

}
