import { Injectable } from '@angular/core';
import { TvRoadLinkChild, TvRoadLinkChildType } from 'app/modules/tv-map/models/tv-road-link-child';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { AbstractControlPoint } from "../../modules/three-js/objects/abstract-control-point";
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { TvContactPoint, TvLaneSide } from 'app/modules/tv-map/models/tv-common';
import { MapService } from '../map.service';
import { SplineService } from '../spline.service';
import { TvUtils } from 'app/modules/tv-map/models/tv-utils';
import { TvJunction } from 'app/modules/tv-map/models/junctions/tv-junction';
import { JunctionConnectionService } from '../junction/junction-connection.service';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';

@Injectable( {
	providedIn: 'root'
} )
export class RoadLinkService {

	constructor (
		private mapService: MapService,
		private splineService: SplineService,
		private connectionService: JunctionConnectionService,
	) { }

	linkPredecessor ( mainRoad: TvRoad, link: TvRoadLinkChild ) {

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

		mainRoad.getFirstLaneSection().lanes.forEach( lane => {

			if ( lane.side !== TvLaneSide.CENTER ) {

				lane.setPredecessor( lane.id * direction );

			}

		} );

		const linkedRoad = this.mapService.map.getRoadById( link.elementId );

		const linkedLaneSection = this.getLaneSection( linkedRoad, link.contactPoint );

		if ( link.contactPoint == TvContactPoint.START ) {

			linkedRoad.setPredecessor( TvRoadLinkChildType.road, mainRoad.id, TvContactPoint.START );

			linkedLaneSection.lanes.forEach( lane => {

				if ( lane.side !== TvLaneSide.CENTER ) {

					lane.setPredecessor( lane.id * direction );

				}

			} );

		} else if ( link.contactPoint == TvContactPoint.END ) {

			linkedRoad.setSuccessor( TvRoadLinkChildType.road, mainRoad.id, TvContactPoint.START );

			linkedLaneSection.lanes.forEach( lane => {

				if ( lane.side !== TvLaneSide.CENTER ) {

					lane.setSuccessor( lane.id * direction );

				}

			} );

		}

	}

	linkSuccessor ( mainRoad: TvRoad, link: TvRoadLinkChild ) {

		if ( !link ) return;

		if ( link.isJunction ) {

			// TODO: might have to update connecting/incoming road

			const junction = this.getElement<TvJunction>( link );

			const s = mainRoad.length;

			const coordA = mainRoad.getPosThetaAt( s ).toRoadCoord( mainRoad );

			const roads = junction.getRoads();

			for ( let i = 0; i < roads.length; i++ ) {

				const road = roads[ i ];

				const s = this.getOtherRoadContact( coordA, road );

				const coordB = road.getPosThetaAt( s ).toRoadCoord( road );

				const connection = this.connectionService.createConnection( junction, coordA, coordB );

				this.connectionService.addConnection( junction, connection );

			}

			return;
		}

		// direction
		// if successor is starting then our direction is positive
		// -> ->
		// if successor is ending then our direction is negative
		// -> <-
		const direction = link.contactPoint === TvContactPoint.START ? 1 : -1;

		mainRoad.getLastLaneSection().lanes.forEach( lane => {

			if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( lane.id * direction );

		} );

		const linkedRoad = this.mapService.map.getRoadById( link.elementId );

		const linkedLaneSection = this.getLaneSection( linkedRoad, link.contactPoint );

		if ( link.contactPoint == TvContactPoint.START ) {

			linkedRoad.setPredecessor( TvRoadLinkChildType.road, mainRoad.id, TvContactPoint.END );

			linkedLaneSection.lanes.forEach( lane => {

				if ( lane.side !== TvLaneSide.CENTER ) {

					lane.setPredecessor( lane.id * direction );

				}

			} );

		} else if ( link.contactPoint == TvContactPoint.END ) {

			linkedRoad.setSuccessor( TvRoadLinkChildType.road, mainRoad.id, TvContactPoint.END );

			linkedLaneSection.lanes.forEach( lane => {

				if ( lane.side !== TvLaneSide.CENTER ) {

					lane.setSuccessor( lane.id * direction );

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

			return road.getFirstLaneSection();

		} else {

			return road.getLastLaneSection();
		}

	}

	removeLinks ( road: TvRoad ) {

		if ( road.isJunction ) {

			road.junctionInstance?.removeConnectingRoad( road );

		} else {

			this.removePredecessor( road );

			this.removeSuccessor( road );

		}
	}

	addLinks ( road: TvRoad ) {

		if ( road.isJunction ) {

			// road.junctionInstance?.removeConnections( road );

		} else {

			this.linkSuccessor( road, road.successor );

			this.linkPredecessor( road, road.predecessor );

		}

	}


	private removeSuccessor ( road: TvRoad ) {

		if ( !road.successor ) return;

		if ( road.successor.isJunction ) {

			const junction = this.getElement<TvJunction>( road.successor );

			const connections = junction.getConnectionsForRoad( road );

			connections.forEach( connection => {

				this.connectionService.removeConnection( junction, connection );

			} );

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

			const junction = this.getElement<TvJunction>( road.predecessor );

			const connections = junction.getConnectionsForRoad( road );

			connections.forEach( connection => {

				this.connectionService.removeConnection( junction, connection );

			} );

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

			this.splineService.hideLines( successor.spline );

			this.splineService.hideControlPoints( successor.spline );

		}

		if ( road.predecessor?.isRoad ) {

			const predecessor = this.getElement<TvRoad>( road.predecessor );

			this.splineService.hideLines( predecessor.spline );

			this.splineService.hideControlPoints( predecessor.spline );

		}

	}

	showLinks ( road: TvRoad, controlPoint: AbstractControlPoint ) {

		if ( this.shouldUpdateSuccessor( road, controlPoint ) ) {

			const successor = this.getElement<TvRoad>( road.successor );

			this.splineService.showLines( successor.spline );

			this.splineService.showControlPoints( successor.spline );

		}

		if ( this.shouldUpdatePredecessor( road, controlPoint ) ) {

			const predecessor = this.getElement<TvRoad>( road.predecessor );

			this.splineService.showLines( predecessor.spline );

			this.splineService.showControlPoints( predecessor.spline );

		}

	}

	updatePredecessor ( road: TvRoad, controlPoint: AbstractControlPoint, rebuild: boolean = false ) {

		if ( road.isJunction ) return;

		if ( !this.shouldUpdatePredecessor( road, controlPoint ) ) return;

		this.updatePredecessorLink( road, road.predecessor );

		this.updatePredecessorElevation( road, road.predecessor );

	}

	updateSuccessor ( road: TvRoad, controlPoint: AbstractControlPoint, rebuild: boolean = false ) {

		if ( road.isJunction ) return;

		if ( !this.shouldUpdateSuccessor( road, controlPoint ) ) return;

		this.updateSuccessorLink( road, road.successor );

		this.updateSuccessorElevation( road, road.successor );
	}

	updateSuccessorElevation ( road: TvRoad, link: TvRoadLinkChild ) {

		if ( !link ) return;

		const successor = this.getElement<TvRoad>( link );

		const prevElevation = road.getElevationValue( road.length );

		successor.addElevation( 0, prevElevation, 0, 0, 0 );

		TvUtils.computeCoefficients( successor.elevationProfile.getElevations(), road.length );

	}

	updatePredecessorElevation ( road: TvRoad, link: TvRoadLinkChild ) {

		if ( !link ) return;

		const predecessor = this.getElement<TvRoad>( link );

		const prevElevation = road.getElevationValue( 0 );

		predecessor.addElevation( predecessor.length, prevElevation, 0, 0, 0 );

		TvUtils.computeCoefficients( predecessor.elevationProfile.getElevations(), road.length );

	}

	private shouldUpdatePredecessor ( road: TvRoad, controlPoint: AbstractControlPoint ) {

		if ( !road.predecessor ) return false;

		if ( road.predecessor.isJunction ) return false;

		const index = road.spline.controlPoints.indexOf( controlPoint );

		return index === 0 || index === 1;

	}

	private shouldUpdateSuccessor ( road: TvRoad, controlPoint: AbstractControlPoint ) {

		if ( !road.successor ) return false;

		if ( road.successor.isJunction ) return false;

		const controlPoints = road.spline.controlPoints;

		const index = road.spline.controlPoints.indexOf( controlPoint );

		return index === controlPoints.length - 1 || index === controlPoints.length - 2;

	}

	private updateSuccessorLink ( road: TvRoad, link: TvRoadLinkChild ) {

		if ( !link ) return;

		const successor = this.getElement<TvRoad>( link );

		const start = road.spline.getSecondLastPoint();
		const mid1 = road.spline.getLastPoint();
		const mid2 = this.getMid2( link );
		const end = this.getEnd( link );

		let distance: number = mid2.position.distanceTo( end.position );

		mid2.position.copy( mid1.position.clone() );

		mid1[ 'hdg' ] = start[ 'hdg' ];

		mid2[ 'hdg' ] = mid1[ 'hdg' ] + Math.PI;

		end.position.copy( mid1.getForwardPosition( distance ) );

		successor.spline.update();

	}

	private updatePredecessorLink ( road: TvRoad, link: TvRoadLinkChild ) {

		if ( !link ) return;

		if ( road.spline.type == 'explicit' ) return;

		const predecessor = this.getElement<TvRoad>( link );

		if ( !predecessor ) return;

		const start = road.spline.getSecondPoint();
		const mid1 = road.spline.getFirstPoint();
		const mid2 = this.getMid2( link );
		const end = this.getEnd( link );

		const distance = mid2.position.distanceTo( end.position );

		mid2.position.copy( mid1.position.clone() );

		mid2[ 'hdg' ] = end[ 'hdg' ] = mid1[ 'hdg' ] + Math.PI;

		const newP4 = mid2.getForwardPosition( distance );

		end.position.copy( newP4 );

		predecessor.spline.update();

	}

	getElement<T> ( link: TvRoadLinkChild ): T {

		if ( link.isRoad ) {

			return this.mapService.map.getRoadById( link.elementId ) as any;

		} else if ( link.isJunction ) {

			return this.mapService.map.getJunctionById( link.elementId ) as any;

		} else {

			throw new Error( 'RoadLinkService.getElement: unknown elementType: ' + link.elementType );

		}

	}

	private getEnd ( link: TvRoadLinkChild ) {

		if ( link.contactPoint == TvContactPoint.START ) {

			return this.getElement<TvRoad>( link ).spline.getSecondPoint();

		} else if ( link.contactPoint == TvContactPoint.END ) {

			return this.getElement<TvRoad>( link ).spline.getSecondLastPoint();

		} else {

			throw new Error( 'RoadLinkService.getEnd: unknown contactPoint: ' + link.contactPoint );

		}

	}

	private getMid2 ( link: TvRoadLinkChild ) {

		if ( link.contactPoint == TvContactPoint.START ) {

			return this.getElement<TvRoad>( link ).spline.getFirstPoint();

		} else if ( link.contactPoint == TvContactPoint.END ) {

			return this.getElement<TvRoad>( link ).spline.getLastPoint();

		} else {

			throw new Error( 'RoadLinkService.getMid2: unknown contactPoint: ' + link.contactPoint );

		}

	}

	private createLinksOld ( firstNode: RoadNode, secondNode: RoadNode, joiningRoad: TvRoad ) {

		const firstRoad = firstNode.road;
		const secondRoad = secondNode.road;

		if ( firstNode.contact === TvContactPoint.START ) {

			// link will be negative as joining roaad will in opposite direction

			firstRoad.setPredecessor( TvRoadLinkChildType.road, joiningRoad.id, TvContactPoint.START );
			firstRoad.getFirstLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( -lane.id );
			} );

			joiningRoad.setPredecessor( TvRoadLinkChildType.road, firstRoad.id, TvContactPoint.START );
			joiningRoad.getFirstLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( -lane.id );
			} );

		} else {

			// links will be in same direction

			firstRoad.setSuccessor( TvRoadLinkChildType.road, joiningRoad.id, TvContactPoint.START );
			firstRoad.getLastLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( lane.id );
			} );

			joiningRoad.setPredecessor( TvRoadLinkChildType.road, firstRoad.id, TvContactPoint.END );
			joiningRoad.getFirstLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( lane.id );
			} );

		}

		if ( secondNode.contact === TvContactPoint.START ) {

			secondRoad.setPredecessor( TvRoadLinkChildType.road, joiningRoad.id, TvContactPoint.END );
			secondRoad.getFirstLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( lane.id );
			} );

			joiningRoad.setSuccessor( TvRoadLinkChildType.road, secondRoad.id, TvContactPoint.START );
			joiningRoad.getLastLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( lane.id );
			} );

		} else {

			secondRoad.setSuccessor( TvRoadLinkChildType.road, joiningRoad.id, TvContactPoint.END );
			secondRoad.getLastLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( -lane.id );
			} );

			joiningRoad.setSuccessor( TvRoadLinkChildType.road, secondRoad.id, TvContactPoint.END );
			joiningRoad.getLastLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( -lane.id );
			} );

		}



	}

}
