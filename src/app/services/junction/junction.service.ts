import { Injectable } from '@angular/core';
import { JunctionFactory } from 'app/factories/junction.factory';
import { TvJunction } from 'app/modules/tv-map/models/junctions/tv-junction';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Box3, Mesh, MeshStandardMaterial, Object3D, Vector3 } from 'three';
import { RoadDividerService } from '../road/road-divider.service';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { JunctionMeshService } from './junction-mesh.service';
import { JunctionNode, JunctionNodeService } from './junction-node.service';
import { DebugDrawService } from '../debug/debug-draw.service';
import { BaseToolService } from 'app/tools/base-tool.service';
import { JunctionConnectionService } from "./junction-connection.service";
import { LaneLinkService } from './lane-link.service';
import { MapService } from '../map.service';
import { Object3DMap } from 'app/tools/lane-width/object-3d-map';
import { TvContactPoint, TvOrientation } from 'app/modules/tv-map/models/tv-common';
import { TvVirtualJunction } from 'app/modules/tv-map/models/junctions/tv-virtual-junction';
import { RoadService } from '../road/road.service';
import { TvRoadLinkChildType } from 'app/modules/tv-map/models/tv-road-link-child';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionService {

	private objectMap = new Object3DMap<TvJunction, Object3D>();

	constructor (
		private factory: JunctionFactory,
		private dividerService: RoadDividerService,
		private junctionNodeService: JunctionNodeService,
		public junctionMeshService: JunctionMeshService,
		public connectionService: JunctionConnectionService,
		public debug: DebugDrawService,
		public base: BaseToolService,
		public laneLinkService: LaneLinkService,
		public mapService: MapService,
		private roadService: RoadService,
	) {
	}

	get junctions () {

		return this.mapService.map.getJunctions();

	}

	buildJunction ( junction: TvJunction ) {

		const connections = junction.getConnections();

		for ( let i = 0; i < connections.length; i++ ) {

			this.roadService.rebuildRoad( connections[ i ].connectingRoad );

		}

		this.createJunctionMesh( junction );

	}

	addJunction ( junction: TvJunction ) {

		this.mapService.map.addJunctionInstance( junction );

		const connections = junction.getConnections();

		for ( let i = 0; i < connections.length; i++ ) {

			const connection = connections[ i ];

			this.roadService.addRoad( connection.connectingRoad );;

		}

	}

	updateJunction ( junction: TvJunction ) {

		this.buildJunction( junction );

	}

	removeJunction ( junction: TvJunction ) {

		this.mapService.map.removeJunction( junction );

		this.removeJunctionMesh( junction );

	}

	createJunctionFromJunctionNodes ( nodes: JunctionNode[] ) {

		console.log( 'createJunctionFromJunctionNodes', nodes[ 0 ], nodes[ 1 ] );

		const coords = nodes.map( node => node.roadCoord );

		const junction = this.factory.createJunction();

		junction.mesh = this.createMeshFromRoadCoords( coords );

		const connections = this.connectionService.createConnections( junction, coords );

		connections.forEach( connection => junction.addConnection( connection ) );

		console.log( connections );

		// make connections

		// make links

		// make connecting-roads

		// update roads links

		return junction;

	}

	createMeshFromRoadCoords ( coords: TvRoadCoord[] ): Mesh {

		const points = [];

		coords.forEach( roadCoord => {

			const s = roadCoord.s;

			const rightT = roadCoord.road.getRightsideWidth( s );
			const leftT = roadCoord.road.getLeftSideWidth( s );

			const leftCorner = roadCoord.road.getPositionAt( s ).addLateralOffset( leftT );
			const rightCorner = roadCoord.road.getPositionAt( s ).addLateralOffset( -rightT );

			points.push( leftCorner );
			points.push( rightCorner );

		} );

		return this.junctionMeshService.createPolygonalMesh( points );

	}

	getUniqueRoads ( coords: TvRoadCoord[] ) {

		const uniqueRoads = [];

		for ( const coord of coords ) {

			if ( !uniqueRoads.includes( coord.road ) ) {
				uniqueRoads.push( coord.road );
			}

		}

		return uniqueRoads;
	}

	createJunctionMesh ( junction: TvJunction ) {

		// const mesh = this.junctionMeshService.createMeshFromJunction( junction );

		// this.objectMap.add( junction, mesh );

		// junction.boundingBox = new Box3().setFromObject( mesh );

	}

	removeJunctionMesh ( junction: TvJunction ) {

		this.objectMap.remove( junction );

	}

	findJunctionForRoads ( incoming: TvRoad, outgoing: TvRoad ): TvJunction {

		let finalJunction: TvJunction = null;

		for ( const junction of this.mapService.map.getJunctions() ) {

			const connections = junction.getConnections();

			for ( let i = 0; i < connections.length; i++ ) {

				const connection = connections[ i ];
				const connectingRoad = connection.connectingRoad;

				if ( connection.incomingRoadId === incoming.id || connection.incomingRoadId === outgoing.id ) {
					finalJunction = junction;
					break;
				}

				if ( connectingRoad?.predecessor.elementId === incoming.id ) {
					finalJunction = junction;
					break;
				}

				if ( connectingRoad?.successor.elementId === outgoing.id ) {
					finalJunction = junction;
					break;
				}
			}

			if ( finalJunction ) break;
		}

		return finalJunction;

	}

	createNewJunction () {

		return this.factory.createJunction();

	}

	createVirtualJunction ( road: TvRoad, sStart: number, sEnd: number, orientation: TvOrientation ): TvVirtualJunction {

		return this.factory.createVirtualJunction( road, sStart, sEnd, orientation );

	}

	createJunctionFromContact (
		roadA: TvRoad, contactA: TvContactPoint,
		roadB: TvRoad, contactB: TvContactPoint
	): TvJunction {

		const junction = this.factory.createJunction();

		this.addConnectionsFromContact( junction, roadA, contactA, roadB, contactB );

		return junction;
	}

	addConnectionsFromContact (
		junction: TvJunction,
		roadA: TvRoad, contactA: TvContactPoint,
		roadB: TvRoad, contactB: TvContactPoint
	): TvJunction {

		const coordA = this.getRoadCoords( roadA, contactA );
		const coordB = this.getRoadCoords( roadB, contactB );

		this.setLink( roadA, contactA, junction );
		this.setLink( roadB, contactB, junction );

		const connectionA = this.connectionService.createConnection( junction, coordA, coordB );
		junction.addConnection( connectionA );

		const connectionB = this.connectionService.createConnection( junction, coordB, coordA );
		junction.addConnection( connectionB );

		return junction;
	}

	setLink ( road: TvRoad, contact: TvContactPoint, junction: TvJunction ) {

		if ( contact == TvContactPoint.START ) {

			road.setPredecessor( TvRoadLinkChildType.junction, junction.id );

		} else if ( contact == TvContactPoint.END ) {

			road.setSuccessor( TvRoadLinkChildType.junction, junction.id );

		}

	}

	getRoadCoords ( road: TvRoad, contact: TvContactPoint ) {

		if ( contact === TvContactPoint.START ) {

			return road.getPositionAt( 0 ).toRoadCoord( road );

		} else {

			return road.getPositionAt( road.length ).toRoadCoord( road );

		}

	}

}
