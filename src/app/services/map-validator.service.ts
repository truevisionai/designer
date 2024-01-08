import { Injectable } from '@angular/core';
import { TvConsole } from 'app/core/utils/console';
import { TvContactPoint } from 'app/modules/tv-map/models/tv-common';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvRoadLinkChild } from 'app/modules/tv-map/models/tv-road-link-child';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Maths } from 'app/utils/maths';
import { DebugDrawService } from './debug/debug-draw.service';
import { Object3DMap } from 'app/tools/lane-width/object-3d-map';
import { Object3D } from 'three';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { DebugTextService } from './debug/debug-text.service';
import { Environment } from 'app/core/utils/environment';
import { MapEvents } from 'app/events/map-events';
import { MapService } from './map.service';

@Injectable( {
	providedIn: 'root'
} )
export class MapValidatorService {

	private map: TvMap;

	private errors = [];

	private debugObjects = new Object3DMap<Object3D, Object3D>();

	constructor (
		private debugDraw: DebugDrawService,
		private debugText: DebugTextService,
		private mapService: MapService,
	) {
		this.init();
	}

	init () {

		if ( Environment.production ) return;

		MapEvents.splineCreated.subscribe( ( spline ) => {

			setTimeout( () => {

				this.validateMap( this.mapService.map );

			}, 1000 );

		} );

		MapEvents.splineUpdated.subscribe( ( spline ) => {

			setTimeout( () => {

				this.validateMap( this.mapService.map );

			}, 1000 );

		} );

		MapEvents.splineRemoved.subscribe( ( spline ) => {

			setTimeout( () => {

				this.validateMap( this.mapService.map );

			}, 1000 );

		} );

	}

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
			if ( !roadB ) {
				const sphere1 = this.debugDraw.createSphere( roadA.getEndPosTheta().position, 1.0, COLOR.MAGENTA );
				this.debugObjects.add( sphere1, sphere1 );
			};
			if ( !roadB ) return;

			const roadAPosition = roadA.getEndPosTheta();
			const roadBPosition = roadB.getPosThetaByContact( successor.contactPoint );

			if ( successor.contactPoint == TvContactPoint.START ) {

				if ( !Maths.approxEquals( roadAPosition.hdg, roadBPosition.hdg ) ) {

					this.errors.push( 'Road:' + roadA.id + ' has invalid hdg with Successor:' + successor.elementType + ':' + successor.elementId + ' ' + roadAPosition.hdg + ' ' + roadBPosition.hdg );

					const arrow1 = this.debugDraw.createArrow( roadAPosition.position, roadAPosition.hdg, COLOR.BLUE );
					this.debugObjects.add( arrow1, arrow1 );

					const arrow2 = this.debugDraw.createArrow( roadBPosition.position, roadBPosition.hdg, COLOR.GREEN );
					this.debugObjects.add( arrow2, arrow2 );

				}

			} else {

				// validate if hdg are facing each other
				const diff = Math.abs( roadAPosition.hdg - roadBPosition.hdg );

				if ( !Maths.approxEquals( diff, Maths.M_PI ) ) {

					this.errors.push( 'Road:' + roadA.id + ' has invalid hdg with Successor:' + successor.elementType + ':' + successor.elementId + ' ' + roadAPosition.hdg + ' ' + roadBPosition.hdg );

					const arrow1 = this.debugDraw.createArrow( roadAPosition.position, roadAPosition.hdg, COLOR.BLUE );
					this.debugObjects.add( arrow1, arrow1 );

					const arrow2 = this.debugDraw.createArrow( roadBPosition.position, roadBPosition.hdg, COLOR.GREEN );
					this.debugObjects.add( arrow2, arrow2 );

				}

			}

			if ( roadAPosition.position.distanceTo( roadBPosition.position ) > 0.01 ) {

				this.errors.push( 'Road:' + roadA.id + ' has invalid distance with Successor:' + successor.elementType + ':' + successor.elementId + ' ' + roadAPosition.position.distanceTo( roadBPosition.position ) );

				const sphere1 = this.debugDraw.createSphere( roadAPosition.position, 0.5, COLOR.BLUE );
				this.debugObjects.add( sphere1, sphere1 );

				const sphere2 = this.debugDraw.createSphere( roadBPosition.position, 0.5, COLOR.GREEN );
				this.debugObjects.add( sphere2, sphere2 );
			}

		}

	}

	validatePredecessor ( roadA: TvRoad, predecessor: TvRoadLinkChild ) {

		if ( predecessor.isRoad ) {

			const roadB = this.map.getRoadById( predecessor.elementId );

			if ( !roadB ) this.errors.push( 'Predecessor not found' + predecessor.elementId + ' for road ' + roadA.id );
			if ( !roadB ) {
				const sphere1 = this.debugDraw.createSphere( roadA.getStartPosTheta().position, 1.0, COLOR.MAGENTA );
				this.debugObjects.add( sphere1, sphere1 );
			};
			if ( !roadB ) return;

			const roadAPosition = roadA.getStartPosTheta();

			const roadBPosition = roadB.getPosThetaByContact( predecessor.contactPoint );

			if ( predecessor.contactPoint == TvContactPoint.END ) {

				if ( !Maths.approxEquals( roadAPosition.hdg, roadBPosition.hdg ) ) {

					this.errors.push( 'Road:' + roadA.id + ' has invalid hdg with Predecessor:' + predecessor.elementType + ':' + predecessor.elementId + ' ' + roadAPosition.hdg + ' ' + roadBPosition.hdg );

					const arrow1 = this.debugDraw.createArrow( roadAPosition.position, roadAPosition.hdg, COLOR.BLUE );
					this.debugObjects.add( arrow1, arrow1 );

					const arrow2 = this.debugDraw.createArrow( roadBPosition.position, roadBPosition.hdg, COLOR.GREEN );
					this.debugObjects.add( arrow2, arrow2 );
				}

			} else {

				const diff = Math.abs( roadAPosition.hdg - roadBPosition.hdg );

				if ( !Maths.approxEquals( diff, Maths.M_PI ) ) {

					this.errors.push( 'Road:' + roadA.id + ' has invalid hdg with Predecessor:' + predecessor.elementType + ':' + predecessor.elementId + ' ' + roadAPosition.hdg + ' ' + roadBPosition.hdg );

					const arrow1 = this.debugDraw.createArrow( roadAPosition.position, roadAPosition.hdg, COLOR.BLUE );
					this.debugObjects.add( arrow1, arrow1 );

					const arrow2 = this.debugDraw.createArrow( roadBPosition.position, roadBPosition.hdg, COLOR.GREEN );
					this.debugObjects.add( arrow2, arrow2 );
				}

			}

			if ( roadAPosition.position.distanceTo( roadBPosition.position ) > 0.01 ) {

				this.errors.push( 'Road:' + roadA.id + ' has invalid distance with Predecessor:' + predecessor.elementType + ':' + predecessor.elementId + ' ' + roadAPosition.position.distanceTo( roadBPosition.position ) );

				const sphere1 = this.debugDraw.createSphere( roadAPosition.position, 0.5, COLOR.BLUE );
				this.debugObjects.add( sphere1, sphere1 );

				const sphere2 = this.debugDraw.createSphere( roadBPosition.position, 0.5, COLOR.GREEN );
				this.debugObjects.add( sphere2, sphere2 );

			}

		}

	}
}
