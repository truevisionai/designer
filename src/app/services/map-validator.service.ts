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
import { TvJunctionConnection } from 'app/modules/tv-map/models/junctions/tv-junction-connection';

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

			this.validateLinks( roads[ i ] );

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

	validateLinks ( roadA: TvRoad ) {

		if ( roadA.successor ) {

			this.validateSuccessor( roadA, roadA.successor );

		}

		if ( roadA.predecessor ) {

			this.validatePredecessor( roadA, roadA.predecessor );

		}

	}

	validateSuccessor ( roadA: TvRoad, link: TvRoadLinkChild ) {

		if ( link.isRoad ) {

			this.validateRoadLink( roadA, link, 'successor' );

		} else if ( link.isJunction ) {

			this.validateJunctionLink( roadA, link, 'successor' );

		}

	}

	validatePredecessor ( roadA: TvRoad, link: TvRoadLinkChild ) {

		if ( link.isRoad ) {

			this.validateRoadLink( roadA, link, 'predecessor' );

		} else if ( link.isJunction ) {

			this.validateJunctionLink( roadA, link, 'predecessor' );

		}

	}

	validateRoadLink ( roadA: TvRoad, link: TvRoadLinkChild, linkType: 'successor' | 'predecessor' ) {

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

	validateJunctionLink ( road: TvRoad, link: TvRoadLinkChild, linkType: 'successor' | 'predecessor' ) {

		const junction = this.map.getJunctionById( link.elementId );

		if ( !junction ) {

			this.errors.push( 'validateJunctionLink: ' + linkType + ' not found ' + link.toString() + ' for road ' + road.id );

			const sphere1 = this.debugDraw.createSphere( road.getEndPosTheta().position, 1.0, COLOR.MAGENTA );
			this.debugObjects.add( sphere1, sphere1 );

			return;
		}

		const incomingContact = linkType == 'successor' ? TvContactPoint.END : TvContactPoint.START;

		const pointA = linkType == 'successor' ? road.getEndPosTheta() : road.getStartPosTheta();

		const incomingConnections = junction.getConnections().filter( c => c.incomingRoad == road );
		const outgoingConnections = junction.getConnections().filter( c => c.outgoingRoad == road );

		for ( let i = 0; i < incomingConnections.length; i++ ) {

			this.validateIncomingLink( incomingConnections[ i ], incomingContact );

		}

		for ( let i = 0; i < outgoingConnections.length; i++ ) {

			const outgoingContact = junction.getOutgoingContact( outgoingConnections[ i ] );

			this.validateOutgoingLink( outgoingConnections[ i ], outgoingContact );

		}

	}

	validateIncomingLink ( connection: TvJunctionConnection, incomingContact: TvContactPoint ) {

		this.validateRoadId( connection.incomingRoadId, connection );
		this.validateRoadId( connection.outgoingRoadId, connection );
		this.validateRoadId( connection.connectingRoadId, connection );

		const incomingPosition = connection.incomingRoad.getPosThetaByContact( incomingContact );
		const connectingPosition = connection.connectingRoad.getPosThetaByContact( connection.contactPoint );

		const distance = incomingPosition.position.distanceTo( connectingPosition.position );

		if ( distance > 0.01 ) {

			this.errors.push( connection.toString() + ' has invalid distance with incoming road ' + connection.incomingRoad.toString() + ' contactPoint:' + incomingContact + ' distance:' + distance );

			const sphere1 = this.debugDraw.createSphere( incomingPosition.position, 0.5, COLOR.BLUE );
			this.debugObjects.add( sphere1, sphere1 );

			const sphere2 = this.debugDraw.createSphere( connectingPosition.position, 0.5, COLOR.GREEN );
			this.debugObjects.add( sphere2, sphere2 );
		}

	}

	validateOutgoingLink ( connection: TvJunctionConnection, outgoingContact: TvContactPoint ) {

		this.validateRoadId( connection.incomingRoadId, connection );
		this.validateRoadId( connection.outgoingRoadId, connection );
		this.validateRoadId( connection.connectingRoadId, connection );

		// for outoing link we need the opposite side of connecting road
		const connectingRoadEndContact = connection.contactPoint == TvContactPoint.START ? TvContactPoint.END : TvContactPoint.START;

		const connectingPosition = connection.connectingRoad.getPosThetaByContact( connectingRoadEndContact );
		const outgoingPosition = connection.outgoingRoad.getPosThetaByContact( outgoingContact );

		const distance = outgoingPosition.position.distanceTo( connectingPosition.position );

		if ( distance > 0.01 ) {

			this.errors.push( connection.toString() + ' has invalid distance with incoming road ' + connection.incomingRoad.toString() + ' contactPoint:' + outgoingContact + ' distance:' + distance );

			const sphere1 = this.debugDraw.createSphere( outgoingPosition.position, 0.5, COLOR.BLUE );
			this.debugObjects.add( sphere1, sphere1 );

			const sphere2 = this.debugDraw.createSphere( connectingPosition.position, 0.5, COLOR.GREEN );
			this.debugObjects.add( sphere2, sphere2 );
		}

	}

	validateRoadId ( id: number, connection: TvJunctionConnection ) {

		const road = this.map.getRoadById( id );

		if ( !road ) {

			this.errors.push( 'ConnectionRoad:' + id + ' not found. ' + connection.toString() );

		}
	}
}
