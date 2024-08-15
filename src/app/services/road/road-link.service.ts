/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoadLink, TvRoadLinkType } from 'app/map/models/tv-road-link';
import { TvRoad } from 'app/map/models/tv-road.model';
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { RoadNode } from 'app/objects/road-node';
import { TvContactPoint, TvLaneSide } from 'app/map/models/tv-common';
import { AbstractSplineDebugService } from '../debug/abstract-spline-debug.service';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { AbstractSpline, SplineType } from 'app/core/shapes/abstract-spline';
import { SplineService } from "../spline/spline.service";
import { JunctionLinkService } from '../junction/junction-link.service';
import { Log } from 'app/core/utils/log';

@Injectable( {
	providedIn: 'root'
} )
export class RoadLinkService {

	constructor (
		private splineDebugService: AbstractSplineDebugService,
		private splineService: SplineService,
		private junctionLinkService: JunctionLinkService,
	) {
	}

	setSuccessor ( prev: TvRoad, next: TvRoad, nextContact: TvContactPoint ) {

		if ( prev.successor?.element instanceof TvRoad ) {

			prev.successor.element.setPredecessorRoad( next, TvContactPoint.END );

		} else if ( prev.successor?.element instanceof TvJunction ) {

			this.replaceJunctionLinks( prev.successor.element as TvJunction, prev, next, TvContactPoint.END );

		}

		if ( nextContact === TvContactPoint.START ) {

			next.successor = prev.successor?.clone();

			next.setPredecessorRoad( prev, TvContactPoint.END );

		} else {

			next.predecessor = prev.successor?.clone();

			next.setSuccessorRoad( prev, TvContactPoint.END );

		}

		prev.setSuccessorRoad( next, TvContactPoint.START );

		this.linkSuccessorLanes( prev, prev.successor );

		this.linkPredecessorLanes( next, next.predecessor );

	}

	replaceJunctionLinks ( junction: TvJunction, oldRoad: TvRoad, newRoad: TvRoad, contactPoint: TvContactPoint ) {

		this.junctionLinkService.replaceIncomingRoad( junction, oldRoad, newRoad, contactPoint );

	}

	updateSuccessorRelationWhileCut ( newRoad: TvRoad, link: TvRoadLink, oldRoad: TvRoad, removed = false ) {

		if ( !newRoad.successor ) return;

		if ( !link ) return;

		if ( link.isRoad ) {

			const successorRoad = link.getElement<TvRoad>();

			if ( link.contactPoint == TvContactPoint.START ) {

				successorRoad.setPredecessorRoad( newRoad, TvContactPoint.END );

			} else if ( link.contactPoint == TvContactPoint.END ) {

				successorRoad.setSuccessorRoad( newRoad, TvContactPoint.END );

			}

		}

		if ( link.isJunction && removed ) {

			const junction = link.getElement<TvJunction>();

			// connections where old road was entering junction
			const incomingConnections = junction.getConnections().filter( i => i.incomingRoad == oldRoad );

			for ( let i = 0; i < incomingConnections.length; i++ ) {

				const connection = incomingConnections[ i ];

				connection.incomingRoad = newRoad;

				connection.laneLink.forEach( link => {

					link.incomingLane = newRoad.laneSections[ 0 ].getLaneById( link.incomingLane.id );

				} );

				connection.connectingRoad.setPredecessorRoad( newRoad, TvContactPoint.END );

			}

		}
	}

	updateSuccessorRelation ( road: TvRoad, previousSegment: TvRoad | TvJunction, link: TvRoadLink, removed = false ) {

		if ( !link ) return;

		if ( !road.successor ) return;

		if ( !previousSegment ) return;

		if ( !( previousSegment instanceof TvRoad ) ) return;

		this.updateSuccessorRelationWhileCut( previousSegment, link, road, removed );

	}

	linkPredecessor ( mainRoad: TvRoad, link: TvRoadLink ) {

		if ( !link ) return;

		if ( link.isJunction ) {
			// TODO: might have to update connecting/incoming road
			return;
		}

		// direction
		// if predecessor is ending then our direction is positive
		// -> ->
		// if predecessor is starting then our direction is negative
		// <- ->
		const direction = link.contactPoint === TvContactPoint.END ? 1 : -1;

		mainRoad.getLaneProfile().getFirstLaneSection().lanes.forEach( lane => {

			if ( lane.side !== TvLaneSide.CENTER ) {

				lane.predecessorId = ( lane.id * direction );

			}

		} );

		const linkedRoad = link.getElement<TvRoad>();

		const linkedLaneSection = this.getLaneSection( linkedRoad, link.contactPoint );

		if ( link.contactPoint == TvContactPoint.START ) {

			linkedRoad.setPredecessor( TvRoadLinkType.ROAD, mainRoad, TvContactPoint.START );

			linkedLaneSection.lanes.forEach( lane => {

				if ( lane.side !== TvLaneSide.CENTER ) {

					lane.predecessorId = ( lane.id * direction );

				}

			} );

		} else if ( link.contactPoint == TvContactPoint.END ) {

			linkedRoad.setSuccessor( TvRoadLinkType.ROAD, mainRoad, TvContactPoint.START );

			linkedLaneSection.lanes.forEach( lane => {

				if ( lane.side !== TvLaneSide.CENTER ) {

					lane.successorId = ( lane.id * direction );

				}

			} );

		}

	}

	getOtherRoadContact ( coordA: TvRoadCoord, road: TvRoad ): number {

		const distance1 = road.getPosThetaAt( 0 ).position.distanceTo( coordA.position );
		const distance2 = road.getPosThetaAt( road.length ).position.distanceTo( coordA.position );

		if ( distance1 < distance2 ) {

			return 0;

		} else {

			return road.length;

		}

	}

	getLaneSection ( road: TvRoad, contactPoint: TvContactPoint ) {

		if ( contactPoint == TvContactPoint.START ) {

			return road.getLaneProfile().getFirstLaneSection();

		} else {

			return road.getLaneProfile().getLastLaneSection();
		}

	}

	removeLinks ( road: TvRoad ) {

		if ( road.isJunction ) {

			// TODO: need to check if this is needed or not
			// road.junctionInstance?.removeConnectingRoad( road );

		} else {

			this.removePredecessor( road );

			this.removeSuccessor( road );

		}
	}

	/**
	 *
	 * @param firstNode
	 * @param secondNode
	 * @param joiningRoad
	 * @deprecated does not work as expected
	 */
	linkRoads ( firstNode: RoadNode, secondNode: RoadNode, joiningRoad: TvRoad ) {

		this.createLinksOld( firstNode, secondNode, joiningRoad );

		// joiningRoad.setPredecessorRoad( firstNode.road, firstNode.contact );

		// joiningRoad.setSuccessorRoad( secondNode.road, secondNode.contact );

		// if ( firstNode.contact === TvContactPoint.START ) {

		// 	firstNode.road.setPredecessorRoad( joiningRoad, TvContactPoint.START );

		// } else {

		// 	firstNode.road.setSuccessorRoad( joiningRoad, TvContactPoint.END );

		// }

		// if ( secondNode.contact === TvContactPoint.START ) {

		// 	secondNode.road.setPredecessorRoad( joiningRoad, TvContactPoint.START );

		// } else {

		// 	secondNode.road.setSuccessorRoad( joiningRoad, TvContactPoint.END );

		// }

	}

	updateLinks ( road: TvRoad, controlPoint: AbstractControlPoint, rebuild: boolean = false ) {

		this.updateSuccessor( road, controlPoint, rebuild );

		this.updatePredecessor( road, controlPoint, rebuild );

	}

	hideLinks ( road: TvRoad ) {

		if ( road.successor?.isRoad ) {

			const successor = this.getElement<TvRoad>( road.successor );

			this.splineDebugService.hideLines( successor.spline );

			this.splineDebugService.hideControlPoints( successor.spline );

		}

		if ( road.predecessor?.isRoad ) {

			const predecessor = this.getElement<TvRoad>( road.predecessor );

			this.splineDebugService.hideLines( predecessor.spline );

			this.splineDebugService.hideControlPoints( predecessor.spline );

		}

	}

	showSplineLinks ( spline: AbstractSpline, controlPoint: AbstractControlPoint ) {

		const firstSegment = spline.segmentMap.getFirst();
		const lastSegment = spline.segmentMap.getLast();

		if ( firstSegment instanceof TvRoad ) this.showLinks( firstSegment, controlPoint );
		if ( lastSegment instanceof TvRoad ) this.showLinks( lastSegment, controlPoint );

	}

	updateSplineLinks ( spline: AbstractSpline, controlPoint: AbstractControlPoint ) {

		const roads = this.splineService.getRoads( spline );

		if ( roads.length == 0 ) return;

		const firstRoad = roads[ 0 ];
		const lastRoad = roads[ roads.length - 1 ];

		this.updateLinks( firstRoad, controlPoint );
		this.updateLinks( lastRoad, controlPoint );

	}

	showLinks ( road: TvRoad, controlPoint: AbstractControlPoint ) {

		if ( this.shouldUpdateSuccessor( road, controlPoint ) ) {

			const successor = this.getElement<TvRoad>( road.successor );

			this.splineDebugService.showLines( successor.spline );

			this.splineDebugService.showControlPoints( successor.spline );

		}

		if ( this.shouldUpdatePredecessor( road, controlPoint ) ) {

			const predecessor = this.getElement<TvRoad>( road.predecessor );

			this.splineDebugService.showLines( predecessor.spline );

			this.splineDebugService.showControlPoints( predecessor.spline );

		}

	}

	updatePredecessor ( road: TvRoad, controlPoint: AbstractControlPoint, rebuild: boolean = false ) {

		if ( road.isJunction ) return;

		if ( !this.shouldUpdatePredecessor( road, controlPoint ) ) return;

		this.updatePredecessorLink( road, road.predecessor );

	}

	updateSuccessor ( road: TvRoad, controlPoint: AbstractControlPoint, rebuild: boolean = false ) {

		if ( road.isJunction ) return;

		if ( !this.shouldUpdateSuccessor( road, controlPoint ) ) return;

		this.updateSuccessorLink( road, road.successor );

	}

	private shouldUpdatePredecessor ( road: TvRoad, controlPoint: AbstractControlPoint ) {

		if ( !road.predecessor ) return false;

		if ( road.predecessor.isJunction ) return false;

		// const index = road.spline.controlPoints.indexOf( controlPoint );

		// return index === 0 || index === 1;

		return true;
	}

	private shouldUpdateSuccessor ( road: TvRoad, controlPoint: AbstractControlPoint ) {

		if ( !road.successor ) return false;

		if ( road.successor.isJunction ) return false;

		// const controlPoints = road.spline.controlPoints;

		// const index = road.spline.controlPoints.indexOf( controlPoint );

		// return index === controlPoints.length - 1 || index === controlPoints.length - 2;

		return true;
	}

	private updateSuccessorLink ( road: TvRoad, link: TvRoadLink ) {

		if ( !link ) return;

		if ( !link.isRoad ) return;

		if ( road.spline.type == SplineType.EXPLICIT ) return;

		const successor = link.element as TvRoad;

		if ( road.spline.uuid == successor.spline.uuid ) return;

		const start = road.spline.getSecondLastPoint();
		const mid1 = road.spline.getLastPoint();
		const mid2 = this.getMid2( successor, link.contactPoint );
		const end = this.getEnd( successor, link.contactPoint );

		if ( !mid2 || !end ) return;

		let distance: number = mid2.position.distanceTo( end.position );

		mid2.position.copy( mid1.position.clone() );

		mid1[ 'hdg' ] = start[ 'hdg' ];

		mid2[ 'hdg' ] = mid1[ 'hdg' ] + Math.PI;

		end.position.copy( mid1.getForwardPosition( distance ) );

		this.splineService.update( successor.spline );

	}

	private updatePredecessorLink ( road: TvRoad, link: TvRoadLink ) {

		if ( !link ) return;

		if ( !link.isRoad ) return;

		if ( road.spline.type == SplineType.EXPLICIT ) return;

		const predecessor = link.element as TvRoad;

		if ( road.spline.uuid == predecessor.spline.uuid ) return;

		const start = road.spline.getSecondPoint();
		const mid1 = road.spline.getFirstPoint();
		const mid2 = this.getMid2( predecessor, link.contactPoint );
		const end = this.getEnd( predecessor, link.contactPoint );

		if ( !mid2 || !end ) return;

		const distance = mid2.position.distanceTo( end.position );

		mid2.position.copy( mid1.position.clone() );

		mid2[ 'hdg' ] = end[ 'hdg' ] = mid1[ 'hdg' ] + Math.PI;

		const newP4 = mid2.getForwardPosition( distance );

		end.position.copy( newP4 );

		this.splineService.update( predecessor.spline );

	}

	getElement<T> ( link: TvRoadLink ): T {

		return link.getElement<T>();

	}

	private getEnd ( road: TvRoad, contactPoint: TvContactPoint ) {

		if ( contactPoint == TvContactPoint.START ) {

			return road.spline.getSecondPoint();

		} else if ( contactPoint == TvContactPoint.END ) {

			return road.spline.getSecondLastPoint();

		} else {

			console.error( 'RoadLinkService.getEnd: unknown contactPoint: ' + contactPoint );

		}

	}

	private getMid2 ( road: TvRoad, contactPoint: TvContactPoint ) {

		if ( contactPoint == TvContactPoint.START ) {

			return road.spline.getFirstPoint();

		} else if ( contactPoint == TvContactPoint.END ) {

			return road.spline.getLastPoint();

		} else {

			console.error( 'RoadLinkService.getMid2: unknown contactPoint: ' + contactPoint );

		}

	}

	/**
	 *
	 * @param firstNode
	 * @param secondNode
	 * @param joiningRoad
	 * @deprecated does not work as expected
	 */
	private createLinksOld ( firstNode: RoadNode, secondNode: RoadNode, joiningRoad: TvRoad ) {

		const firstRoad = firstNode.road;
		const secondRoad = secondNode.road;

		if ( firstNode.contact === TvContactPoint.START ) {

			// link will be negative as joining roaad will in opposite direction

			firstRoad.setPredecessor( TvRoadLinkType.ROAD, joiningRoad, TvContactPoint.START );
			firstRoad.getLaneProfile().getFirstLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.predecessorId = ( -lane.id );
			} );

			joiningRoad.setPredecessor( TvRoadLinkType.ROAD, firstRoad, TvContactPoint.START );
			joiningRoad.getLaneProfile().getFirstLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.predecessorId = ( -lane.id );
			} );

		} else {

			// links will be in same direction

			firstRoad.setSuccessor( TvRoadLinkType.ROAD, joiningRoad, TvContactPoint.START );
			firstRoad.getLaneProfile().getLastLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.successorId = ( lane.id );
			} );

			joiningRoad.setPredecessor( TvRoadLinkType.ROAD, firstRoad, TvContactPoint.END );
			joiningRoad.getLaneProfile().getFirstLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.predecessorId = ( lane.id );
			} );

		}

		if ( secondNode.contact === TvContactPoint.START ) {

			secondRoad.setPredecessor( TvRoadLinkType.ROAD, joiningRoad, TvContactPoint.END );
			secondRoad.getLaneProfile().getFirstLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.predecessorId = ( lane.id );
			} );

			joiningRoad.setSuccessor( TvRoadLinkType.ROAD, secondRoad, TvContactPoint.START );
			joiningRoad.getLaneProfile().getLastLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.successorId = ( lane.id );
			} );

		} else {

			secondRoad.setSuccessor( TvRoadLinkType.ROAD, joiningRoad, TvContactPoint.END );
			secondRoad.getLaneProfile().getLastLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.successorId = ( -lane.id );
			} );

			joiningRoad.setSuccessor( TvRoadLinkType.ROAD, secondRoad, TvContactPoint.END );
			joiningRoad.getLaneProfile().getLastLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.successorId = ( -lane.id );
			} );

		}


	}

	private removeSuccessor ( road: TvRoad ) {

		if ( !road.successor ) return;

		if ( road.successor.isJunction ) {

			// const junction = this.getElement<TvJunction>( road.successor );

			// const connections = junction.getConnectionsForRoad( road );

			// connections.forEach( connection => {

			// 	this.connectionService.removeConnection( junction, connection );

			// } );

			return;
		}

		const linkedRoad = this.getElement<TvRoad>( road.successor );

		if ( !linkedRoad ) return;

		if ( road.successor.contactPoint === TvContactPoint.START ) {

			linkedRoad.predecessor = null;

		} else {

			linkedRoad.successor = null;

		}

		// road.successor = null;
	}

	private removePredecessor ( road: TvRoad ) {

		if ( !road.predecessor ) return;

		if ( road.predecessor.isJunction ) {

			// const junction = this.getElement<TvJunction>( road.predecessor );

			// const connections = junction.getConnectionsForRoad( road );

			// connections.forEach( connection => {

			// 	this.connectionService.removeConnection( junction, connection );

			// } );

			return;
		}

		const linkedRoad = this.getElement<TvRoad>( road.predecessor );

		if ( !linkedRoad ) return;

		if ( road.predecessor.contactPoint === TvContactPoint.START ) {

			linkedRoad.predecessor = null;

		} else {

			linkedRoad.successor = null;

		}

		// road.predecessor = null;
	}

	private linkSuccessorLanes ( road: TvRoad, link: TvRoadLink ) {

		if ( !link ) {
			Log.warn( "link is null", road.toString() );
			return
		}

		if ( link.isJunction ) return;

		const laneSection = road.getLaneProfile().getLastLaneSection();

		const otherLaneSection = this.getLaneSection( link.element as TvRoad, link.contactPoint );

		if ( !laneSection.isMatching( otherLaneSection ) ) {
			return;
		}

		const sign = link.contactPoint == TvContactPoint.START ? 1 : -1;

		laneSection.lanes.forEach( lane => {

			const otherLane = otherLaneSection.getLaneById( lane.id * sign );

			if ( otherLane ) {

				lane.successorId = otherLane.id;

				lane.successorUUID = otherLane.uuid;

			} else {

				lane.successorId == null;

				lane.successorUUID = null;

			}

		} );

	}

	private linkPredecessorLanes ( road: TvRoad, link: TvRoadLink ) {

		if ( !link ) {
			Log.warn( "link is null", road.toString() );
			return
		}

		if ( link.isJunction ) return;

		const laneSection = road.getLaneProfile().getFirstLaneSection();

		const otherLaneSection = this.getLaneSection( link.element as TvRoad, link.contactPoint );

		if ( !laneSection.isMatching( otherLaneSection ) ) {
			return;
		}

		const sign = link.contactPoint == TvContactPoint.END ? 1 : -1;

		laneSection.lanes.forEach( lane => {

			const otherLane = otherLaneSection.getLaneById( lane.id * sign );

			if ( otherLane ) {

				lane.predecessorId = otherLane.id;

				lane.predecessorUUID = otherLane.uuid;

			} else {

				lane.predecessorId == null;

				lane.predecessorUUID = null;

			}

		} );
	}
}
