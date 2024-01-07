import { Injectable } from '@angular/core';
import { TvConsole } from 'app/core/utils/console';
import { TvContactPoint } from 'app/modules/tv-map/models/tv-common';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvRoadLinkChild } from 'app/modules/tv-map/models/tv-road-link-child';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Maths } from 'app/utils/maths';

@Injectable( {
	providedIn: 'root'
} )
export class MapValidatorService {

	private map: TvMap;

	private errors = [];

	constructor () { }

	setMap ( map: TvMap ) {

		this.map = map;

	}

	getErrors () {

		return this.errors;

	}

	validateMap ( map: TvMap, throwError = false ) {

		this.map = map;

		this.errors = [];

		const roads = this.map.getRoads();

		for ( let i = 0; i < roads.length; i++ ) {

			this.hasValidConnections( roads[ i ] );

		}

		for ( let i = 0; i < this.errors.length; i++ ) {

			if ( throwError ) {

				throw new Error( this.errors[ i ] );

			} else {

				console.error( this.errors[ i ] );
				TvConsole.error( this.errors[ i ] );

			}

		}

		return this.errors.length === 0;

	}

	hasValidConnections ( roadA: TvRoad ): boolean {

		if ( roadA.successor ) {

			this.validateSuccessor( roadA, roadA.successor );

		}

		if ( roadA.predecessor ) {

			this.validatePredecessor( roadA, roadA.predecessor );

		}

		return true;
	}

	validateSuccessor ( roadA: TvRoad, successor: TvRoadLinkChild ) {

		if ( successor.isRoad ) {

			const roadB = this.map.getRoadById( successor.elementId );

			if ( !roadB ) this.errors.push( 'Successor not found' + successor.elementId + ' for road ' + roadA.id );
			if ( !roadB ) return;

			const roadAPosition = roadA.getEndPosTheta();
			const roadBPosition = roadB.getPosThetaByContact( successor.contactPoint );

			if ( successor.contactPoint == TvContactPoint.START ) {
				if ( !Maths.approxEquals( roadAPosition.hdg, roadBPosition.hdg ) ) {
					this.errors.push( 'Road:' + roadA.id + ' has invalid hdg with Successor:' + successor.elementId + ' ' + roadAPosition.hdg + ' ' + roadBPosition.hdg );
				}
			} else {
				// validate if hdg are facing each other
				const diff = Math.abs( roadAPosition.hdg - roadBPosition.hdg );
				if ( !Maths.approxEquals( diff, Maths.M_PI ) ) {
					this.errors.push( 'Road:' + roadA.id + ' has invalid hdg with Successor:' + successor.elementId + ' ' + roadAPosition.hdg + ' ' + roadBPosition.hdg );
				}
			}


			if ( roadAPosition.position.distanceTo( roadBPosition.position ) > 0.01 ) {
				this.errors.push( 'Road:' + roadA.id + ' has invalid distance with Successor:' + successor.elementId + ' ' + roadAPosition.position.distanceTo( roadBPosition.position ) );
			}
		}

	}

	validatePredecessor ( roadA: TvRoad, predecessor: TvRoadLinkChild ) {

		if ( predecessor.isRoad ) {

			const roadB = this.map.getRoadById( predecessor.elementId );

			if ( !roadB ) this.errors.push( 'Predecossor not found' + predecessor.elementId + ' for road ' + roadA.id );
			if ( !roadB ) return;

			const roadAPosition = roadA.getStartPosTheta();

			const roadBPosition = roadB.getPosThetaByContact( predecessor.contactPoint );

			if ( predecessor.contactPoint == TvContactPoint.END ) {
				if ( !Maths.approxEquals( roadAPosition.hdg, roadBPosition.hdg ) ) {
					this.errors.push( 'Road ' + roadA.id + ' has invalid hdg with predecessor connection ' + roadAPosition.hdg + ' ' + roadBPosition.hdg );
				}
			} else {
				const diff = Math.abs( roadAPosition.hdg - roadBPosition.hdg );
				if ( !Maths.approxEquals( diff, Maths.M_PI ) ) {
					this.errors.push( 'Road ' + roadA.id + ' has invalid hdg with predecessor connection ' + roadAPosition.hdg + ' ' + roadBPosition.hdg );
				}
			}


			if ( roadAPosition.position.distanceTo( roadBPosition.position ) > 0.01 ) {
				this.errors.push( 'Road ' + roadA.id + ' has invalid distance with predecessor connection ' + roadAPosition.position.distanceTo( roadBPosition.position ) );
			}
		}

	}
}
