import { Injectable } from '@angular/core';
import { TvRoadLinkChild, TvRoadLinkChildType } from 'app/modules/tv-map/models/tv-road-link-child';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { AbstractControlPoint } from "../../modules/three-js/objects/abstract-control-point";
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { TvContactPoint, TvLaneSide } from 'app/modules/tv-map/models/tv-common';

@Injectable( {
	providedIn: 'root'
} )
export class RoadLinkService {

	constructor () { }

	removeLinks ( road: TvRoad ) {

		if ( road.isJunction ) return;

		this.removePredecessor( road );

		this.removeSuccessor( road );

	}

	removeSuccessor ( road: TvRoad ) {

		if ( !road.successor ) return;

		if ( road.successor.elementType === TvRoadLinkChildType.junction ) {
			return;
		}

		const linkedRoad = road.successor.road;

		if ( !linkedRoad ) return;

		if ( road.successor.contactPoint === TvContactPoint.START ) {

			linkedRoad.predecessor = null;

		} else {

			linkedRoad.successor = null;

		}

		road.successor = null;
	}

	removePredecessor ( road: TvRoad ) {

		if ( !road.predecessor ) return;

		if ( road.predecessor.elementType === TvRoadLinkChildType.junction ) {
			return;
		}

		const linkedRoad = road.predecessor.road;

		if ( !linkedRoad ) return;

		if ( road.predecessor.contactPoint === TvContactPoint.START ) {

			linkedRoad.predecessor = null;

		} else {

			linkedRoad.successor = null;

		}

		road.predecessor = null;
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

		road.successor?.hideSpline();

		road.predecessor?.hideSpline();

	}

	showLinks ( road: TvRoad, controlPoint: AbstractControlPoint ) {

		if ( this.shouldUpdateSuccessor( road, controlPoint ) ) {

			road.successor?.showSpline();

		}

		if ( this.shouldUpdatePredecessor( road, controlPoint ) ) {

			road.predecessor?.showSpline();

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

		const index = road.spline?.controlPoints.indexOf( controlPoint );

		return index === 0 || index === 1;

	}

	private shouldUpdateSuccessor ( road: TvRoad, controlPoint: AbstractControlPoint ) {

		const controlPoints = road.spline.controlPoints;

		const index = road.spline?.controlPoints.indexOf( controlPoint );

		return index === controlPoints.length - 1 || index === controlPoints.length - 2;

	}

	private updateSuccessorLink ( road: TvRoad, link: TvRoadLinkChild ) {

		if ( !link ) return;

		const successor = link.getElement<TvRoad>();

		const start = road.spline.getSecondLastPoint();
		const mid1 = road.spline.getLastPoint();
		const mid2 = link.mid2;
		const end = link.end;

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

		const predecessor = link.getElement<TvRoad>();

		if ( !predecessor ) return;

		const start = road.spline.getSecondPoint();
		const mid1 = road.spline.getFirstPoint();
		const mid2 = link.mid2;
		const end = link.end;

		const distance = mid2.position.distanceTo( end.position );

		mid2.position.copy( mid1.position.clone() );

		mid2[ 'hdg' ] = end[ 'hdg' ] = mid1[ 'hdg' ] + Math.PI;

		const newP4 = mid2.getForwardPosition( distance );

		end.position.copy( newP4 );

		predecessor.spline.update();

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
