import { Injectable } from '@angular/core';
import { JunctionFactory } from 'app/factories/junction.factory';
import { TvJunction } from 'app/modules/tv-map/models/tv-junction';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Vector3 } from 'three';
import { RoadCutterService } from '../road/road-cutter.service';
import { ManeuverService } from './maneuver.service';
import { BaseService } from '../base.service';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionService extends BaseService {

	private roadCuttingService = new RoadCutterService();
	private maneuverService = new ManeuverService();

	createJunction ( roadA: TvRoad, roadB: TvRoad, position: Vector3 ): TvJunction {

		const junction = JunctionFactory.createJunction();

		const roadANext = this.roadCuttingService.cutRoadAt( roadA, 10 );
		const roadBNext = this.roadCuttingService.cutRoadAt( roadB, 10 );

		return junction;
	}

	create4x4Junction ( roadA: TvRoad, roadB: TvRoad, position: Vector3 ): TvJunction {

		const junction = JunctionFactory.createJunction();

		const roadANext = this.roadCuttingService.cutRoadAt( roadA, 10 );
		const roadBNext = this.roadCuttingService.cutRoadAt( roadB, 10 );

		return junction;
	}

	createTJunction ( headRoad: TvRoad, incomingRoad: TvRoad, position: Vector3 ): TvJunction {

		const junction = JunctionFactory.createJunction();

		const roadANext = this.roadCuttingService.cutRoadAt( headRoad, 10 );

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
