/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvConsole } from 'app/core/utils/console';
import { TvContactPoint } from 'app/map/models/tv-common';
import { TvMap } from 'app/map/models/tv-map.model';
import { TvLink } from 'app/map/models/tv-link';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Maths } from 'app/utils/maths';
import { DebugDrawService } from '../debug/debug-draw.service';
import { Object3DMap } from 'app/core/models/object3d-map';
import { Object3D, Vector2, Vector3 } from "three";
import { ColorUtils } from 'app/views/shared/utils/colors.service';
import { DebugTextService } from '../debug/debug-text.service';
import { Environment } from 'app/core/utils/environment';
import { MapEvents } from 'app/events/map-events';
import { MapService } from './map.service';
import { TvJunctionConnection } from 'app/map/models/connections/tv-junction-connection';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvLane } from 'app/map/models/tv-lane';
import { TvElectronService } from '../tv-electron.service';
import { RoadService } from '../road/road.service';
import { LaneUtils } from 'app/utils/lane.utils';
import { Log } from 'app/core/utils/log';
import { ModelNotFoundException } from 'app/exceptions/exceptions';
import { SplineUtils } from 'app/utils/spline.utils';
import { RoadUtils } from 'app/utils/road.utils';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { TvJunction } from 'app/map/models/junctions/tv-junction';


const SPHERE_SIZE = 0.1;

export function expectLinkDistanceToBeZero ( road: TvRoad ): void {
	if ( road.successor ) {
		const distance = RoadUtils.distanceFromSuccessor( road, road.successor );
		if ( !Maths.approxEquals( distance, 0, 0.001 ) ) {
			Log.warn( `InvalidSuccessorDistance: ${ distance } ${ road.toString() } ${ road.successor.toString() }` );
		}
	}
	if ( road.predecessor ) {
		const distance = RoadUtils.distanceFromPredecessor( road, road.predecessor )
		if ( !Maths.approxEquals( distance, 0, 0.001 ) ) {
			Log.warn( `InvalidPredecessorDistance: ${ distance } ${ road.toString() } ${ road.predecessor.toString() }` );
		}
	}
}

function expectCorrectSegmentOrder ( spline: AbstractSpline ): void {
	if ( !SplineUtils.areLinksCorrect( spline ) ) {
		Log.error( 'Incorrect segment order' );
	}
}

function expectValidMap ( mapService: MapService ): void {
	mapService.nonJunctionRoads.forEach( road => {
		expectLinkDistanceToBeZero( road );
	} );

	mapService.nonJunctionSplines.forEach( spline => {
		expectCorrectSegmentOrder( spline );
	} );
}

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
		private electron: TvElectronService,
		private roadService: RoadService,
	) {
		this.init();
	}

	init (): void {

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

	setMap ( map: TvMap ): void {

		this.map = map;

	}

	getErrors (): any[] {

		return this.errors;

	}

	validateMap ( map: TvMap, throwError: boolean = false ): boolean {

		this.map = map;

		this.errors = [];

		this.debugObjects.clear();

		const roads = this.map.getRoads();

		for ( let i = 0; i < roads.length; i++ ) {

			this.validateRoad( roads[ i ] );

		}

		expectValidMap( this.mapService );

		for ( let i = 0; i < this.errors.length; i++ ) {

			if ( throwError ) {

				throw new Error( this.errors[ i ] );

			} else {

				Log.warn( this.errors[ i ] );

			}

		}

		return this.errors.length === 0;

	}

	validateRoad ( road: TvRoad ): void {

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
	validateLaneSections ( road: TvRoad ): void {

		const laneSections = road.getLaneProfile().getLaneSections();

		if ( laneSections.length == 0 ) {
			this.errors.push( `${ road.toString() } has no lane sections` );
			return;
		}

		const firstLaneSection = laneSections[ 0 ];

		if ( firstLaneSection.s != 0 ) {
			this.errors.push( `${ road.toString() } first lane section s != 0${ firstLaneSection.toString() }` );
		}

		laneSections.forEach( laneSection => {
			this.validateLaneSection( road, laneSection );
		} )

	}

	validateLaneSectionAreInOrder ( road: TvRoad, laneSections: TvLaneSection[] ): void {

		for ( let i = 1; i < laneSections.length; i++ ) {

			const previous = laneSections[ i - 1 ];
			const current = laneSections[ i ];

			if ( current.s < previous.s ) {
				this.errors.push( `${ road.toString() } lane section not in order of increasing s${ previous.toString() }${ current.toString() }` );
			}

			if ( current.s === previous.s ) {
				this.errors.push( `${ road.toString() } lane sections cannot be equal s${ previous.toString() }${ current.toString() }` );
			}

			this.validateLaneSection( road, current );
		}
	}

	validateLaneSection ( road: TvRoad, laneSection: TvLaneSection ): void {

		if ( laneSection.getLaneCount() == 0 ) {
			this.errors.push( `${ road.toString() } LaneSection has no lanes ${ laneSection.toString() }` );
		}

		if ( laneSection.getCenterLanes().length == 0 ) {
			this.errors.push( `${ road.toString() } LaneSection has no center lanes ${ laneSection.toString() }` );
		}

		if ( laneSection.getCenterLanes().length > 1 ) {
			this.errors.push( `${ road.toString() } LaneSection has more than one center lane ${ laneSection.toString() }` );
		}

		if ( laneSection.getLaneCount() < 2 ) {
			this.errors.push( `${ road.toString() } LaneSection has less than 2 lanes ${ laneSection.toString() }` );
		}

		for ( const lane of laneSection.getLanes() ) {

			if ( lane.id == 0 ) continue;

			this.validateLane( road, laneSection, lane );

		}

		this.validateLanesAreInOrder( road, laneSection );

		this.validateLaneIdsAreNotDuplicate( road, laneSection );

	}

	validateLaneIdsAreNotDuplicate ( road: TvRoad, laneSection: TvLaneSection ): void {

		// Lane numbering shall be unique per lane section.
		const laneIds = [];

		for ( const lane of laneSection.getLanes() ) {

			if ( laneIds.includes( lane.id ) ) {
				this.errors.push( `${ road.toString() } LaneSection has duplicate lane id ${ laneSection.toString() }` );
			}

			laneIds.push( lane.id );
		}

	}

	validateLanesAreInOrder ( road: TvRoad, laneSection: TvLaneSection ): void {

		// Lane numbering shall start with 1 next to the center lane in
		// positive t-direction in ascending order and -1 next to the center lane
		// in negative t-direction in descending order.
		// Lane numbering shall be consecutive without any gaps.
		// 4 3 2 1 0 -1 -2 -3
		if ( !laneSection.areLeftLanesInOrder() ) {
			const laneIds = laneSection.getLeftLanes().map( lane => lane.id );
			this.errors.push( `${ road.toString() } left lanes are not in order ${ laneSection.toString() } LaneIds:${ laneIds }` );
		}

		if ( !laneSection.areRightLanesInOrder() ) {
			const laneIds = laneSection.getRightLanes().map( lane => lane.id );
			this.errors.push( `${ road.toString() } right lanes are not in order ${ laneSection.toString() } LaneIds:${ laneIds }` );
		}
	}

	validateLane ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ): void {

		if ( lane.getLaneWidthCount() == 0 ) {
			this.errors.push( `${ road.toString() } ${ lane.toString() } has no width` );
		}

		this.validateLaneWidth( lane );

		// this.validateLaneLinks( road, laneSection, lane );

		this.validatePolynomials( lane.borders );

	}

	validateLaneWidth ( lane: TvLane ): void {

		this.validatePolynomials( lane.getWidthArray() );

	}

	validatePolynomials ( polynomials: { s: number }[] ): void {

		for ( let i = 1; i < polynomials.length; i++ ) {

			const previous = polynomials[ i - 1 ];
			const current = polynomials[ i ];

			if ( current.s < previous.s ) {
				this.errors.push( `Polynomials not in order of increasing s ${ previous.toString() }${ current.toString() }` );
			}

			if ( current.s === previous.s ) {
				this.errors.push( `Polynomials cannot have equal s ${ previous.toString() }${ current.toString() }` );
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
	validateLaneLinks ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ): void {

		if ( !road.isJunction && road.successor?.isRoad && !lane.successorExists ) {

			if ( road.successor.laneSection.getLaneCount() != laneSection.getLaneCount() ) {

				this.errors.push( `${ road.toString() } has successor ${ road.successor.toString() } but lane:${ lane.id } has no successor` );

			} else {

				if ( road.successor.contactPoint == TvContactPoint.END ) {

					this.errors.push( `${ road.toString() } has successor ${ road.successor.toString() } but lane:${ lane.id } has no successor` );

				}

			}

		}

		if ( !road.isJunction && road.predecessor?.isRoad && !lane.predecessorExists ) {

			if ( road.predecessor.laneSection.getLaneCount() != laneSection.getLaneCount() ) {

				this.errors.push( `${ road.toString() } has predecessor ${ road.predecessor.toString() } but lane:${ lane.id } has no predecessor` );

			} else {

				if ( road.predecessor.contactPoint == TvContactPoint.START ) {

					this.errors.push( `${ road.toString() } has predecessor ${ road.predecessor.toString() } but lane:${ lane.id } has no predecessor` );

				}

			}

		}

	}

	validateRoadLinks ( roadA: TvRoad ): void {

		if ( roadA.successor ) this.validateSuccessor( roadA, roadA.successor );

		if ( roadA.predecessor ) this.validatePredecessor( roadA, roadA.predecessor );

	}

	validateSuccessor ( roadA: TvRoad, link: TvLink ): void {

		if ( link.isRoad ) {

			this.validateRoadLink( roadA, link, 'successor' );

		} else if ( link.isJunction ) {

			this.validateJunctionLink( roadA, link, 'successor' );

		}

	}

	validatePredecessor ( roadA: TvRoad, link: TvLink ): void {

		if ( link.isRoad ) {

			this.validateRoadLink( roadA, link, 'predecessor' );

		} else if ( link.isJunction ) {

			this.validateJunctionLink( roadA, link, 'predecessor' );

		}

	}

	validateRoadLink ( roadA: TvRoad, link: TvLink, linkType: 'successor' | 'predecessor' ): void {

		if ( !link.isRoad ) return;

		let roadB: TvRoad;

		try {

			roadB = link.getElement() as TvRoad;

		} catch ( error ) {

			if ( error instanceof ModelNotFoundException ) {

				this.errors.push( `${ linkType } not found for road ${ roadA.toString() } link: ${ link.toString() }` );

				const sphere1 = this.debugDraw.createSphere( roadA.getEndPosTheta().position, SPHERE_SIZE * 10, ColorUtils.MAGENTA );
				this.debugObjects.add( sphere1, sphere1 );

				return;

			} else {

				Log.error( 'An unexpected error occurred:', error.message );

			}

		}

		if ( !roadB ) {

			this.errors.push( `${ linkType } not found ${ link.toString() } for road ${ roadA.id }` );

			const sphere1 = this.debugDraw.createSphere( roadA.getEndPosTheta().position, SPHERE_SIZE * 10, ColorUtils.MAGENTA );
			this.debugObjects.add( sphere1, sphere1 );

			return;
		}

		this.validateLinkHeading( roadA, roadB, link, linkType );

		// NOTE: Below Lane side validation is not working as expected
		// fails in scenario
		// add3ConnectedSplinesv2
		/**
		 * --------------------------------------------
		 *  	R1  =>	|	<=  R2	 	| => R3
		 * --------------------------------------------
		 */

		// const mainLaneSection = linkType == 'successor' ? roadA.getLaneProfile().getLaseLaneSection() : roadA.getLaneProfile().getFirstLaneSection();

		// mainLaneSection.lanes.forEach( ( mainLane ) => {

		// 	if ( mainLane.id == 0 ) return;

		// 	let otherPosition: any;

		// 	const mainPosition = this.roadService.findLaneStartPosition( roadA, mainLaneSection, mainLane, linkType == 'successor' ? roadA.length : 0 );

		// 	if ( linkType == 'successor' ) {

		// 		const nextLaneSection = LaneUtils.findNextLaneSection( roadA, mainLaneSection );
		// 		const nextLane = LaneUtils.findSuccessorLane( roadA, mainLaneSection, mainLane );
		// 		const offset = link.contactPoint == TvContactPoint.START ? 0 : roadB.length;

		// 		if ( !nextLane ) {
		// 			this.errors.push( label + ':' + roadA.id + ' has no successor lane ' + linkType + ':' + link.type + ':' + link.id );
		// 			return;
		// 		}

		// 		otherPosition = this.roadService.findLaneStartPosition( roadB, nextLaneSection, nextLane, offset );

		// 	} else {

		// 		const prevLaneSection = LaneUtils.findPreviousLaneSection( roadA, mainLaneSection );
		// 		const prevLane = LaneUtils.findPredecessorLane( roadA, mainLaneSection, mainLane );
		// 		const offset = link.contactPoint == TvContactPoint.START ? 0 : roadB.length;

		// 		if ( !prevLane ) {
		// 			this.errors.push( label + ':' + roadA.id + ' has no predecessor lane ' + linkType + ':' + link.type + ':' + link.id );
		// 			return;
		// 		}

		// 		otherPosition = this.roadService.findLaneStartPosition( roadB, prevLaneSection, prevLane, offset );

		// 	}


		// 	const distance = mainPosition.position.distanceTo( otherPosition.position );

		// 	if ( distance > 0.01 ) {

		// 		this.errors.push( label + ':' + roadA.id + ' has invalid distance ' + linkType + ':' + link.type + ':' + link.id + ' ' + distance );

		// 		const sphere1 = this.debugDraw.createSphere( mainPosition.position, SPHERE_SIZE, COLOR.BLUE );
		// 		this.debugObjects.add( sphere1, sphere1 );

		// 		const sphere2 = this.debugDraw.createSphere( otherPosition.position, SPHERE_SIZE, COLOR.GREEN );
		// 		this.debugObjects.add( sphere2, sphere2 );

		// 		const line = this.debugDraw.createLine( [ mainPosition.position, otherPosition.position ], COLOR.MAGENTA );
		// 		this.debugObjects.add( line, line );
		// 	}

		// } );

	}

	validateLinkHeading ( roadA: TvRoad, roadB: TvRoad, link: TvLink, linkType: string ): void {

		const contactA = linkType === 'successor' ? TvContactPoint.END : TvContactPoint.START;
		const pointA = roadA.getContactPosition( contactA );
		const pointB = link.getPosition();
		const label = roadA.isJunction ? 'ConnectingRoad' : 'Road';

		const headingShouldBeSame = link.contactPoint !== contactA;

		const hdgA = pointA.normalizedHdg;
		const hdgB = pointB.normalizedHdg;

		// Tolerance for heading comparison
		// 0.01 (about 0.57°)
		// 0.05 (about 2.86°)
		// 0.10 (about 5.72°)
		const TOLERANCE = 0.05;

		if ( headingShouldBeSame ) {
			if ( !this.areHeadingsApproximatelyEqual( hdgA, hdgB, TOLERANCE ) ) {
				this.reportError( label, roadA.id, 'same', linkType, link, hdgA, hdgB );
			}
		} else {
			if ( !this.areHeadingsApproximatelyOpposite( hdgA, hdgB, TOLERANCE ) ) {
				this.reportError( label, roadA.id, 'facing', linkType, link, hdgA, hdgB );
			}
		}

	}

	private areHeadingsApproximatelyEqual ( hdg1: number, hdg2: number, tolerance: number ): boolean {
		const diff = Math.abs( hdg1 - hdg2 );
		return Math.min( diff, 2 * Math.PI - diff ) < tolerance;
	}

	private areHeadingsApproximatelyOpposite ( hdg1: number, hdg2: number, tolerance: number ): boolean {
		const diff = Math.abs( hdg1 - hdg2 );
		const smallestDiff = Math.min( diff, 2 * Math.PI - diff );
		return Math.abs( Math.PI - smallestDiff ) < tolerance;
	}

	private reportError ( label: string, roadId: number, expectedDirection: string, linkType: string, link: TvLink, hdgA: number, hdgB: number ): void {

		this.errors.push( `${ label }:${ roadId } invalid hdg, should be ${ expectedDirection } ${ linkType }:${ link.toString() } ${ hdgA } ${ hdgB }` );

		// const arrow1 = this.debugDraw.createArrow( pointA.position, hdgA, COLOR.BLUE );
		// this.debugObjects.add( arrow1, arrow1 );

		// const arrow2 = this.debugDraw.createArrow( pointB.position, hdgB, COLOR.GREEN );
		// this.debugObjects.add( arrow2, arrow2 );
	}

	validateJunctionLink ( road: TvRoad, link: TvLink, linkType: 'successor' | 'predecessor' ): void {

		try {

			const junction = link.getElement() as TvJunction;

			const contactPoint = linkType == 'successor' ? road.getEndPosTheta() : road.getStartPosTheta();
			const distanceFromJunction = junction.distanceToPoint( new Vector2( contactPoint.position.x, contactPoint.position.y ) );

			if ( !junction.getIncomingRoads().includes( road ) ) {
				Log.warn( 'No Connections With Junction', road.toString(), link.toString() );
			}

			if ( !Maths.approxEquals( distanceFromJunction, 0 ) ) {
				Log.warn( 'Contact Point Outside Junction', road.toString(), link.toString() );
			}


		} catch ( error ) {

			if ( error instanceof ModelNotFoundException ) {

				this.errors.push( `validateJunctionLink: ${ linkType } not found ${ link.toString() } for road ${ road.id }` );

				const sphere1 = this.debugDraw.createSphere( road.getEndPosTheta().position, SPHERE_SIZE, ColorUtils.MAGENTA );

				this.debugObjects.add( sphere1, sphere1 );

			} else {

				Log.error( 'An unexpected error occurred:', error.message );

			}

		}

	}

	validateConnection ( connection: TvJunctionConnection, incomingContact: TvContactPoint ): void {

		this.validateConnectionAndRoad( connection.incomingRoadId, connection );
		this.validateConnectionAndRoad( connection.connectingRoadId, connection );

		connection.getLaneLinks().forEach( link => {

			// const incomingLaneSection = link.incomingRoad.getLaneProfile().getLaneSectionAtContact( link.incomingContactPoint );
			// const incomingSOffset = link.incomingContactPoint == TvContactPoint.START ? 0 : link.incomingRoad.length;
			// const incomingPosition = this.roadService.findLaneStartPosition( link.incomingRoad, incomingLaneSection, link.incomingLane, incomingSOffset );
			//
			// const connectingLaneSection = link.connectingRoad.getLaneProfile().getLaneSectionAtContact( link.connectingContactPoint );
			// const connectingSOffset = link.connectingContactPoint == TvContactPoint.START ? 0 : link.connectingRoad.length;
			// const connectingPosition = this.roadService.findLaneStartPosition( link.connectingRoad, connectingLaneSection, link.connectingLane, connectingSOffset );
			//
			// const distance = incomingPosition.position.distanceTo( connectingPosition.position );
			//
			// if ( distance > 0.01 ) {
			//
			// 	this.errors.push( connection.toString() + ' has invalid distance with incoming road ' + connection.incomingRoad.toString() + ' contactPoint:' + incomingContact + ' distance:' + distance );
			//
			// 	const sphere1 = this.debugDraw.createSphere( incomingPosition.position, SPHERE_SIZE, COLOR.BLUE );
			// 	this.debugObjects.add( sphere1, sphere1 );
			//
			// 	const sphere2 = this.debugDraw.createSphere( connectingPosition.position, SPHERE_SIZE, COLOR.GREEN );
			// 	this.debugObjects.add( sphere2, sphere2 );
			//
			// 	const line = this.debugDraw.createLine( [ incomingPosition.position, connectingPosition.position ], COLOR.ORANGE );
			// 	this.debugObjects.add( line, line );
			// }

		} );
	}

	validateConnectingRoad ( connection: TvJunctionConnection ): void {

		this.validateConnectionAndRoad( connection.incomingRoadId, connection );
		this.validateConnectionAndRoad( connection.connectingRoadId, connection );

		this.validateRoadLinks( connection.connectingRoad );

		// connection.laneLink.forEach( link => {

		// 	// const incomingLaneSection = connection.incomingRoad.getLaneProfile().getLaneSectionAtContact( link.incomingContactPoint );
		// 	// const incomingSOffset = link.incomingContactPoint == TvContactPoint.START ? 0 : link.incomingRoad.length;
		// 	// const incomingPosition = this.roadService.findLaneStartPosition( link.incomingRoad, incomingLaneSection, link.incomingLane, incomingSOffset );

		// 	// const connectingLaneSection = link.connectingRoad.getLaneProfile().getLaneSectionAtContact( link.connectingContactPoint );
		// 	// const connectingSOffset = link.connectingContactPoint == TvContactPoint.START ? 0 : link.connectingRoad.length;
		// 	// const connectingPosition = this.roadService.findLaneStartPosition( link.connectingRoad, connectingLaneSection, link.connectingLane, connectingSOffset );

		// 	// const distance = incomingPosition.position.distanceTo( connectingPosition.position );

		// 	// if ( distance > 0.01 ) {

		// 	// 	this.errors.push( connection.toString() + ' has invalid distance with incoming road ' + connection.incomingRoad.toString() + ' contactPoint:' + incomingContact + ' distance:' + distance );

		// 	// 	const sphere1 = this.debugDraw.createSphere( incomingPosition.position, SPHERE_SIZE, COLOR.BLUE );
		// 	// 	this.debugObjects.add( sphere1, sphere1 );

		// 	// 	const sphere2 = this.debugDraw.createSphere( connectingPosition.position, SPHERE_SIZE, COLOR.GREEN );
		// 	// 	this.debugObjects.add( sphere2, sphere2 );

		// 	// 	const line = this.debugDraw.createLine( [ incomingPosition.position, connectingPosition.position ], COLOR.ORANGE );
		// 	// 	this.debugObjects.add( line, line );
		// 	// }

		// } );

	}

	validateConnectionAndRoad ( id: number, connection: TvJunctionConnection ): void {

		try {

			this.map.getRoad( id );

		} catch ( error ) {

			if ( error instanceof ModelNotFoundException ) {

				this.errors.push( `Road:${ id } not found. ${ connection.toString() }` );

			} else {

				Log.error( 'An unexpected error occurred:', error.message );

			}

		}

	}

}
