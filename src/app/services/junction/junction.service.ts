import { Injectable } from '@angular/core';
import { JunctionFactory } from 'app/factories/junction.factory';
import { TvJunction } from 'app/modules/tv-map/models/junctions/tv-junction';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Mesh, MeshStandardMaterial, Object3D, Vector3 } from 'three';
import { RoadDividerService } from '../road/road-divider.service';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { JunctionMeshService } from './junction-mesh.service';
import { JunctionNode, JunctionNodeService } from './junction-node.service';
import { DebugDrawService } from '../debug/debug-draw.service';
import { BaseToolService } from 'app/tools/base-tool.service';
import { JunctionConnectionService } from "./junction-connection.service";
import { LaneLinkService } from './lane-link.service';
import { MapService } from '../map.service';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { Object3DMap } from 'app/tools/lane-width/object-3d-map';
import { TvRoadLinkChildType } from 'app/modules/tv-map/models/tv-road-link-child';
import { MapEvents, RoadCreatedEvent } from 'app/events/map-events';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionService {

	public static instance: JunctionService;

	private objectMap = new Object3DMap<TvJunction, Object3D>();

	constructor (
		private dividerService: RoadDividerService,
		private junctionNodeService: JunctionNodeService,
		public junctionMeshService: JunctionMeshService,
		public connectionService: JunctionConnectionService,
		public debug: DebugDrawService,
		public base: BaseToolService,
		public laneLinkService: LaneLinkService,
		public mapService: MapService
	) {
		JunctionService.instance = this;
	}

	addJunction ( junction: TvJunction ) {

		this.mapService.map.addJunctionInstance( junction );

		junction.connections.forEach( connection => {

			connection.incomingRoad.setSuccessor( TvRoadLinkChildType.junction, junction.id );

			connection.outgoingRoad.setPredecessor( TvRoadLinkChildType.junction, junction.id );

			this.mapService.map.addRoad( connection.connectingRoad );

			MapEvents.roadCreated.emit( new RoadCreatedEvent( connection.connectingRoad ) );

		} );

		this.createJunctionMesh( junction );

	}

	removeJunction ( junction: TvJunction ) {

		this.mapService.map.removeJunction( junction );

		this.removeJunctionMesh( junction );

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

	createJunctionFromCoords ( coords: TvRoadCoord[] ) {

		const uniqueRoads = this.getUniqueRoads( coords );

		if ( uniqueRoads.length == 1 ) {

			for ( const road of uniqueRoads ) {

				const sortedCoords = coords.filter( i => i.road === road ).sort( ( a, b ) => a.s - b.s );

				const firstCoord = sortedCoords[ 0 ];
				const lastCoord = sortedCoords[ sortedCoords.length - 1 ];

				const roads = this.dividerService.cutRoadFromTo( road, firstCoord.s, lastCoord.s );

				// this.mapService.map.removeRoad( road );
				// this.mapService.map.addRoads( roads );

				// MapEvents.roadRemoved.emit( new RoadRemovedEvent( road ) )
				// roads.forEach( road => MapEvents.roadCreated.emit( new RoadCreatedEvent( road ) ) );

				// automatically maneuvers

			}

			// for ( const coord of coords ) {

			// 	const newRoad = this.dividerService.cutRoadAt( coord.road, coord.s );

			// 	this.mapService.map.addRoad( newRoad );

			// }

		}

		if ( uniqueRoads.length == 2 ) {

		}

	}

	createJunctionFromJunctionNodes ( nodes: JunctionNode[] ) {

		console.log( 'createJunctionFromJunctionNodes', nodes[ 0 ], nodes[ 1 ] );

		const coords = nodes.map( node => node.roadCoord );

		const junction = JunctionFactory.createJunction();

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

		const mesh = this.junctionMeshService.createMeshFromJunction( junction );

		this.objectMap.add( junction, mesh );

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


}
