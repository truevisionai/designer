import { Injectable } from '@angular/core';
import { JunctionFactory } from 'app/factories/junction.factory';
import { TvJunction } from 'app/modules/tv-map/models/tv-junction';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Vector3 } from 'three';
import { RoadCutterService } from '../road/road-cutter.service';
import { ManeuverService } from './maneuver.service';
import { BaseService } from '../base.service';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { MapEvents, RoadCreatedEvent, RoadRemovedEvent, RoadUpdatedEvent } from 'app/events/map-events';
import { JunctionMeshService } from './junction-mesh.service';
import { JunctionNode } from './junction-node.service';
import { SceneService } from '../scene.service';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionService extends BaseService {

	public meshService = new JunctionMeshService();

	private roadCuttingService = new RoadCutterService();
	private maneuverService = new ManeuverService();

	createJunctionFromCoords ( coords: TvRoadCoord[] ) {

		const uniqueRoads = this.getUniqueRoads( coords );

		if ( uniqueRoads.length == 1 ) {

			for ( const road of uniqueRoads ) {

				const sortedCoords = coords.filter( i => i.road === road ).sort( ( a, b ) => a.s - b.s );

				const firstCoord = sortedCoords[ 0 ];
				const lastCoord = sortedCoords[ sortedCoords.length - 1 ];

				const roads = this.roadCuttingService.cutRoadFromTo( road, firstCoord.s, lastCoord.s );

				// this.map.removeRoad( road );
				// this.map.addRoads( roads );

				// MapEvents.roadRemoved.emit( new RoadRemovedEvent( road ) )
				// roads.forEach( road => MapEvents.roadCreated.emit( new RoadCreatedEvent( road ) ) );

				// automatically maneuvers

			}

			// for ( const coord of coords ) {

			// 	const newRoad = this.roadCuttingService.cutRoadAt( coord.road, coord.s );

			// 	this.map.addRoad( newRoad );

			// }

		}

		if ( uniqueRoads.length == 2 ) {

		}

	}

	createJunctionFromJunctionNodes ( nodes: JunctionNode[] ) {

		console.log( 'createJunctionFromJunctionNodes', nodes[ 0 ], nodes[ 1 ] );

		const coords = nodes.map( node => node.roadCoord );

		this.createJunctionFromRoadCoords( coords );

	}

	createJunctionFromRoadCoords ( coords: TvRoadCoord[] ) {

		const points = [];

		coords.forEach( roadCoord => {

			const s = roadCoord.s;

			const rightT = roadCoord.road.getRightsideWidth( s );
			const leftT = roadCoord.road.getLeftSideWidth( s );

			const leftPosition = roadCoord.road.getPositionAt( s ).addLateralOffset( leftT );
			const rightPosition = roadCoord.road.getPositionAt( s ).addLateralOffset( -rightT );

			points.push( leftPosition );
			points.push( rightPosition );

		} );

		SceneService.addToolObject( this.meshService.createPolygonalMesh( points ) );

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

	createJunction ( roadA: TvRoad, roadB: TvRoad, position: Vector3 ): TvJunction {

		const junction = JunctionFactory.createJunction();

		const roadANext = this.roadCuttingService.splitRoadAt( roadA, 10 );
		const roadBNext = this.roadCuttingService.splitRoadAt( roadB, 10 );

		return junction;
	}

	create4x4Junction ( roadA: TvRoad, roadB: TvRoad, position: Vector3 ): TvJunction {

		const junction = JunctionFactory.createJunction();

		const roadANext = this.roadCuttingService.splitRoadAt( roadA, 10 );
		const roadBNext = this.roadCuttingService.splitRoadAt( roadB, 10 );

		return junction;
	}

	createTJunction ( headRoad: TvRoad, incomingRoad: TvRoad, position: Vector3 ): TvJunction {

		const junction = JunctionFactory.createJunction();

		const roadANext = this.roadCuttingService.splitRoadAt( headRoad, 10 );

		//const roadBNext = this.roadCuttingService.cutRoadAt( incomingRoad, 10 );

		// this.maneuverService.createConnectingRoad()

		return junction;
	}

	updateJunction ( roadA: TvRoad, roadB: TvRoad, position: Vector3 ) {



	}

	findJunctionForRoads ( incoming: TvRoad, outgoing: TvRoad ): TvJunction {

		let finalJunction: TvJunction = null;

		for ( const junction of this.map.getJunctions() ) {

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
