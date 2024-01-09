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

		this.debugObjects.clear();

		const roads = this.map.getRoads();

		for ( let i = 0; i < roads.length; i++ ) {

			this.hasValidConnections( roads[ i ] );

		}

		for ( let i = 0; i < this.errors.length; i++ ) {

			if ( throwError ) {

				throw new Error( this.errors[ i ] );

			} else {

				console.error( 'MapValidationFailed', this.errors[ i ] );
				TvConsole.error( 'MapValidationFailed: ' + this.errors[ i ] );

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

	validateLink ( roadA: TvRoad, link: TvRoadLinkChild, linkType: 'successor' | 'predecessor' ) {

		if ( !link.isRoad ) return;

		const roadB = this.map.getRoadById( link.elementId );
		const label = roadA.isJunction ? 'ConnectingRoad' : 'Road';

		if ( !roadB ) {

			this.errors.push( linkType + ' not found ' + link.toString() + ' for road ' + roadA.id );

			const sphere1 = this.debugDraw.createSphere( roadA.getEndPosTheta().position, 1.0, COLOR.MAGENTA );
			this.debugObjects.add( sphere1, sphere1 );

			return;
		}

		const pointA = linkType == 'successor' ? roadA.getEndPosTheta() : roadA.getStartPosTheta();
		const pointB = roadB.getPosThetaByContact( link.contactPoint );

		let headingShouldBeSame: boolean = false;

		if ( linkType == 'successor' && link.contactPoint == TvContactPoint.START || linkType == 'predecessor' && link.contactPoint == TvContactPoint.END ) {
			headingShouldBeSame = true;
		}

		if ( headingShouldBeSame ) {

			if ( !Maths.approxEquals( pointA.normalizedHdg, pointB.normalizedHdg ) ) {

				this.errors.push( label + ':' + roadA.id + ' invalid hdg, should be same ' + linkType + ':' + link.toString() + ' ' + pointA.normalizedHdg + ' ' + pointB.normalizedHdg );

				const arrow1 = this.debugDraw.createArrow( pointA.position, pointA.normalizedHdg, COLOR.BLUE );
				this.debugObjects.add( arrow1, arrow1 );

				const arrow2 = this.debugDraw.createArrow( pointB.position, pointB.normalizedHdg, COLOR.GREEN );
				this.debugObjects.add( arrow2, arrow2 );

			}

		} else {

			// validate if hdg are facing each other
			let diff = Math.abs( pointA.normalizedHdg - pointB.normalizedHdg );

			// Adjust the difference to find the smaller angle
			diff = Math.min( diff, 2 * Math.PI - diff );

			if ( !Maths.approxEquals( diff, Maths.M_PI ) ) {

				this.errors.push( label + ':' + roadA.id + ' invalid hdg, should be facing ' + linkType + ':' + link.toString() + ' ' + pointA.normalizedHdg + ' ' + pointB.normalizedHdg );

				const arrow1 = this.debugDraw.createArrow( pointA.position, pointA.normalizedHdg, COLOR.BLUE );
				this.debugObjects.add( arrow1, arrow1 );

				const arrow2 = this.debugDraw.createArrow( pointB.position, pointB.normalizedHdg, COLOR.GREEN );
				this.debugObjects.add( arrow2, arrow2 );

			}

		}

		const distance = pointA.position.distanceTo( pointB.position );

		if ( distance > 0.01 ) {

			this.errors.push( label + ':' + roadA.id + ' has invalid distance ' + linkType + ':' + link.elementType + ':' + link.elementId + ' ' + distance );

			const sphere1 = this.debugDraw.createSphere( pointA.position, 0.5, COLOR.BLUE );
			this.debugObjects.add( sphere1, sphere1 );

			const sphere2 = this.debugDraw.createSphere( pointB.position, 0.5, COLOR.GREEN );
			this.debugObjects.add( sphere2, sphere2 );
		}

	}

	validateSuccessor ( roadA: TvRoad, successor: TvRoadLinkChild ) {

		this.validateLink( roadA, successor, 'successor' );

	}

	validatePredecessor ( roadA: TvRoad, predecessor: TvRoadLinkChild ) {

		this.validateLink( roadA, predecessor, 'predecessor' );

	}
}
