/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Log } from 'app/core/utils/log';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvContactPoint, TvLaneSide } from 'app/map/models/tv-common';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvRoadLink } from 'app/map/models/tv-road-link';
import { TvRoad } from 'app/map/models/tv-road.model';
import { MapQueryService } from 'app/map/queries/map-query.service';
import { MapService } from 'app/services/map/map.service';
import { RoadGeometryService } from 'app/services/road/road-geometry.service';
import { Maths } from 'app/utils/maths';
import { RoadUtils } from 'app/utils/road.utils';

@Injectable( {
	providedIn: 'root'
} )
export class RoadFixerService {

	private debug = true;
	private enabled = true;

	constructor ( private map: MapService, private queryService: MapQueryService ) { }

	fix ( road: TvRoad ) {

		if ( road.successor ) this.validateDistanceFromSuccessor( road, road.successor );

		if ( !this.enabled ) return;

		this.fixLinks( road );

		this.fixLaneSections( road );

		if ( road.successor ) this.fixLaneLinkWithSuccessor( road, road.successor );

	}

	private fixLaneLinkWithSuccessor ( road: TvRoad, link: TvRoadLink ) {

		return;

		if ( link.isJunction ) return;

		if ( road.isJunction ) return;

		const laneSection = road.laneSections[ road.laneSections.length - 1 ];

		const nextRoad = link.element as TvRoad;
		const nextLaneSection = nextRoad.getLaneProfile().getLaneSectionAtContact( link.contact );

		const currentLanes = laneSection.getLaneArray();
		const nextLanes = nextLaneSection.getLaneArray();

		if ( laneSection.isMatching( nextLaneSection ) ) {

			for ( let index = 0; index < currentLanes.length; index++ ) {

				const currentLane = currentLanes[ index ];

				if ( currentLane.side == TvLaneSide.CENTER ) continue;

				const nextLane = nextLanes[ index ];

				if ( nextLane == null ) {
					currentLane.successorId = null;
					continue;
				}

				if ( currentLane.successorId == null ) {

					if ( this.debug ) Log.warn( "Fixing SuccessorLane", currentLane.toString(), nextLane.toString() );

					currentLane.successorId = nextLane.id;

				} else if ( currentLane.successorId !== nextLane.id ) {

					if ( this.debug ) Log.warn( "Fixing Successor not matching", currentLane.toString(), nextLane.toString() );

					currentLane.successorId = nextLane.id;

				}

			}

		} else {

			Log.warn( "Lane Section not matching", laneSection.toString(), nextLaneSection.toString() );

		}

	}

	private fixLinks ( road: TvRoad ) {

		const fixSuccessor = ( road: TvRoad, link: TvRoadLink ) => {

			let successor: TvJunction | TvRoad;

			if ( link.isJunction ) {
				successor = this.map.findJunction( link.element.id );
			} else if ( link.isRoad ) {
				successor = this.map.getRoad( link.element.id );
			} else {
				Log.warn( "Invalid Link", road.toString(), link.toString() );
			}

			if ( !successor ) {
				Log.warn( "Successor not found", road.toString(), link.toString() );
			}

			// RoadUtils.unlinkSuccessor( road );
			//
			// road.spline.segmentMap.remove( link.element );

		}

		const fixPredecessor = ( road: TvRoad, link: TvRoadLink ) => {

			let predecessor: TvJunction | TvRoad;

			if ( link.isJunction ) {
				predecessor = this.map.findJunction( link.element.id );
			} else if ( link.isRoad ) {
				predecessor = this.map.getRoad( link.element.id );
			} else {
				Log.warn( "Invalid Link", road.toString(), link.toString() );
			}

			if ( !predecessor ) {
				Log.warn( "Predecessor not found", road.toString(), link.toString() );
			}

			// RoadUtils.unlinkPredecessor( road );
			//
			// road.spline.segmentMap.remove( link.element );

		}

		if ( road.successor ) fixSuccessor( road, road.successor );

		if ( road.predecessor ) fixPredecessor( road, road.predecessor );

	}

	private fixLaneSections ( road: TvRoad ) {

		return;

		const laneSections = road.laneSections;

		for ( let i = 0; i < laneSections.length; i++ ) {

			const current = laneSections[ i ];

			const next = laneSections[ i + 1 ];

			if ( !next ) continue;

			this.fixLaneSection( current, next );

		}

	}

	private fixLaneSection ( current: TvLaneSection, next: TvLaneSection ) {

		return;

		const currentLanes = current.getLaneArray();

		const nextLanes = next.getLaneArray();

		if ( current.isMatching( next ) ) {

			for ( let index = 0; index < currentLanes.length; index++ ) {

				const currentLane = currentLanes[ index ];

				const nextLane = nextLanes[ index ];

				if ( currentLane.successorId !== nextLane.id ) {

					if ( this.debug ) Log.warn( "Lane Successor not matching", currentLane.toString(), nextLane.toString() );

					currentLane.successorId = nextLane.id;

				}

				if ( nextLane.predecessorId = currentLane.id ) {

					if ( this.debug ) Log.warn( "Lane Predecessor not matching", currentLane.toString(), nextLane.toString() );

					nextLane.predecessorId = currentLane.id;

				}

			}

		}

	}

	private validateDistanceFromSuccessor ( road: TvRoad, link: TvRoadLink ) {

		// this is not working for connecting roads for our junctions
		if ( road.isJunction ) return;

		const validate = ( predecessor: TvRoad, successor: TvRoad, contact: TvContactPoint ) => {

			const predecessorLaneSection = predecessor.laneSections[ predecessor.laneSections.length - 1 ];
			const successorLaneSection = successor.getLaneProfile().getLaneSectionAtContact( contact );

			predecessorLaneSection.lanes.forEach( lane => {

				if ( lane.side == TvLaneSide.CENTER ) return;

				const successorLane = successorLaneSection.getLaneById( lane.id );

				if ( !successorLane ) {
					Log.warn( "Successor Lane not found", lane.toString(), successor.toString() );
					return;
				}

				const sContact = contact === TvContactPoint.START ? 0 : successor.length;

				const positionA = RoadGeometryService.instance.findLaneCenterPosition( predecessor, predecessorLaneSection, lane, predecessor.length );

				const positionB = RoadGeometryService.instance.findLaneCenterPosition( successor, successorLaneSection, successorLane, sContact );

				const distance = positionA.toVector2().distanceTo( positionB.toVector2() );

				if ( !Maths.approxEquals( distance, 0 ) ) {

					Log.warn( `Invalid Distance:${ distance } With Successor Lane`, predecessor.toString(), successor.toString(), lane.toString() );

				}

			} );

		}

		if ( link.isRoad ) {

			const successor = link.element as TvRoad;

			validate( road, successor, link.contact );


		} else if ( link.isJunction ) {

			const junction = link.element as TvJunction;

			const connections = junction.getConnections().filter( connection => connection.incomingRoad === road );

			connections.forEach( connection => {

				// this is not working for connecting roads for our junctions
				// validate( road, connection.connectingRoad, connection.contactPoint );

			} );

			if ( connections.length === 0 ) {

				Log.warn( "No connections found for road", road.toString() );

			}

		}

	}
}
