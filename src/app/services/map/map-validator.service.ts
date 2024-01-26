/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvConsole } from 'app/core/utils/console';
import { TvContactPoint } from 'app/map/models/tv-common';
import { TvMap } from 'app/map/models/tv-map.model';
import { TvRoadLinkChild } from 'app/map/models/tv-road-link-child';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Maths } from 'app/utils/maths';
import { DebugDrawService } from '../debug/debug-draw.service';
import { Object3DMap } from 'app/core/models/object3d-map';
import { Object3D } from 'three';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { DebugTextService } from '../debug/debug-text.service';
import { Environment } from 'app/core/utils/environment';
import { MapEvents } from 'app/events/map-events';
import { MapService } from './map.service';
import { TvJunctionConnection } from 'app/map/models/junctions/tv-junction-connection';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvLane } from 'app/map/models/tv-lane';
import { TvElectronService } from '../tv-electron.service';

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
		private electron: TvElectronService
	) {
		this.init();
	}

	init () {

		if ( !this.electron.isElectronApp ) return;

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

			this.validateRoad( roads[ i ] );

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

	validateRoad ( road: TvRoad ) {

		this.validateRoadLinks( road );

		this.validateLaneSections( road );

	}

	/**

	The following rules apply to lane sections:
	Each road shall have at least one lane section.
	<laneSection> elements shall be defined in ascending order according to the s-coordinate.
	The length of lane sections shall be greater than zero.
	There shall always be exactly one center lane at each s-position.
	Using lanes with a width of 0 for long distances should be avoided.
	A new lane section shall be defined each time the number of lanes change.
	A lane section shall remain valid until a new lane section is defined.
	The properties of lanes inside a lane section may be changed as often as needed.
	Lane sections may be defined for one side of the road only using the @singleSide attribute.

	 * @param road
	 * @returns
	 */
	validateLaneSections ( road: TvRoad ) {

		const validLaneSection = ( laneSection: TvLaneSection ) => {

			if ( laneSection.getLaneCount() == 0 ) {
				this.errors.push( 'Road:' + road.id + ' LaneSection has no lanes ' + laneSection.toString() );
			}

			if ( laneSection.getCenterLanes().length == 0 ) {
				this.errors.push( 'Road:' + road.id + ' LaneSection has no center lanes ' + laneSection.toString() );
			}

			if ( laneSection.getCenterLanes().length > 1 ) {
				this.errors.push( 'Road:' + road.id + ' LaneSection has more than one center lane ' + laneSection.toString() );
			}

			if ( laneSection.getLaneCount() < 2 ) {
				this.errors.push( 'Road:' + road.id + ' LaneSection has less than 2 lanes ' + laneSection.toString() );
			}

			for ( const [ id, lane ] of laneSection.lanes ) {

				if ( id == 0 ) continue;

				this.validateLane( road, laneSection, lane );

			}

			// Lane numbering shall start with 1 next to the center lane in
			// positive t-direction in ascending order and -1 next to the center lane
			// in negative t-direction in descending order.
			// Lane numbering shall be consecutive without any gaps.
			// 4 3 2 1 0 -1 -2 -3
			if ( !laneSection.areLeftLanesInOrder() ) {

				const laneIds = laneSection.getLeftLanes().map( lane => lane.id );

				this.errors.push( road.toString() + ' left lanes are not in order ' + laneSection.toString() + ' LaneIds:' + laneIds );

			}

			if ( !laneSection.areRightLanesInOrder() ) {

				const laneIds = laneSection.getRightLanes().map( lane => lane.id );

				this.errors.push( road.toString() + ' right lanes are not in order ' + laneSection.toString() + ' LaneIds:' + laneIds );

			}

			// Lane numbering shall be unique per lane section.
			const laneIds = [];

			for ( const [ id, lane ] of laneSection.lanes ) {

				if ( laneIds.includes( id ) ) {
					this.errors.push( road.toString() + ' LaneSection has duplicate lane id ' + laneSection.toString() );
				}

				laneIds.push( id );

			}



		}

		if ( road.laneSections.length == 0 ) {
			this.errors.push( 'Road:' + road.id + ' has no lane sections' );
			return;
		}

		const firstLaneSection = road.laneSections[ 0 ];

		if ( firstLaneSection.s != 0 ) {
			this.errors.push( 'Road:' + road.id + ' first lane section s != 0' + firstLaneSection.toString() );
		}

		validLaneSection( firstLaneSection );

		for ( let i = 1; i < road.laneSections.length; i++ ) {

			const prevLaneSection = road.laneSections[ i - 1 ];
			const laneSection = road.laneSections[ i ];

			if ( laneSection.s < prevLaneSection.s ) {
				this.errors.push( 'Road:' + road.id + ' lane section not in order of increasing s' + prevLaneSection.toString() + laneSection.toString() );
			}

			if ( Maths.approxEquals( laneSection.s, prevLaneSection.s ) ) {
				this.errors.push( 'Road:' + road.id + ' lane section s is not increasing' + prevLaneSection.toString() + laneSection.toString() );
			}

			validLaneSection( laneSection );

		}

	}

	validateLane ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		if ( lane.width.length == 0 ) {
			this.errors.push( 'Road:' + road.id + ' Lane:' + lane.id + ' has no width' );
		}

		this.validateLaneWidth( lane );

		this.validateLaneLinks( road, laneSection, lane );

		this.validatePolynomials( lane.borders );

	}

	validateLaneWidth ( lane: TvLane ) {

		this.validatePolynomials( lane.width );

	}

	validatePolynomials ( polynomials: { s: number }[] ) {

		for ( let i = 1; i < polynomials.length; i++ ) {

			const prev = polynomials[ i - 1 ];
			const current = polynomials[ i ];

			if ( prev.s > current.s ) {
				this.errors.push( 'Polynomials not in order of increasing s ' + prev.toString() + current.toString() );
			}

			if ( Maths.approxEquals( prev.s, current.s ) ) {
				this.errors.push( 'Polynomials distance should be more than 0 ' + prev.toString() + current.toString() );
			}

		}

	}

	/**
	 * The following rules apply to lane linkage:
	 * - A lane may have another lane as predecessor or successor.
	 * - Two lanes shall only be linked if their linkage is clear. If the relationship to a predecessor or successor is ambiguous, junctions shall be used.
	 * - Multiple predecessors and successors shall be used if a lane is split abruptly or several lanes are merged abruptly. All lanes that are connected shall have a non-zero width at the connection point.
	 * - Lanes that have a width of zero at the beginning of the lane section shall have no <predecessor> element.
	 * - Lanes that have a width of zero at the end of the lane section shall have no <successor> element.
	 * - The <link> element shall be omitted if the lane starts or ends in a junction or has no link.
	 * @param road
	 * @param laneSection
	 * @param lane
	 */
	validateLaneLinks ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		if ( !road.isJunction && road.successor?.isRoad && !lane.successor ) {

			if ( road.successor.laneSection.getLaneCount() != laneSection.getLaneCount() ) {

				this.errors.push( road.toString() + ' has successor ' + road.successor.toString() + ' but lane:' + lane.id + ' has no successor' );

			} else {

				if ( road.successor.contactPoint == TvContactPoint.END ) {

					this.errors.push( road.toString() + ' has successor ' + road.successor.toString() + ' but lane:' + lane.id + ' has no successor' );

				}

			}

		}

		if ( !road.isJunction && road.predecessor?.isRoad && !lane.predecessor ) {

			if ( road.predecessor.laneSection.getLaneCount() != laneSection.getLaneCount() ) {

				this.errors.push( road.toString() + ' has predecessor ' + road.predecessor.toString() + ' but lane:' + lane.id + ' has no predecessor' );

			} else {

				if ( road.predecessor.contactPoint == TvContactPoint.START ) {

					this.errors.push( road.toString() + ' has predecessor ' + road.predecessor.toString() + ' but lane:' + lane.id + ' has no predecessor' );

				}

			}

		}

	}

	validateRoadLinks ( roadA: TvRoad ) {

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

			if ( !Maths.approxEquals( diff, Maths.PI ) ) {

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
