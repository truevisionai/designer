/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvContactPoint } from "app/map/models/tv-common";
import { TvRoadLink, TvRoadLinkType } from "app/map/models/tv-road-link";
import { TvRoad } from "app/map/models/tv-road.model";
import { TvJunction } from "../map/models/junctions/tv-junction";
import { Vector2 } from "three";

export class RoadUtils {

	static distanceFromSuccessor ( road: TvRoad, link: TvRoadLink ): number {

		const end = road.getEndPosTheta();

		if ( link.element instanceof TvRoad ) {

			const position = link.contactPoint === TvContactPoint.START ? link.element.getStartPosTheta() : link.element.getEndPosTheta();

			return end.distanceTo( position );

		} else if ( link.element instanceof TvJunction ) {

			const point = new Vector2( end.position.x, end.position.y );

			return link.element.boundingBox.distanceToPoint( point );

		}

	}

	static distanceFromPredecessor ( road: TvRoad, link: TvRoadLink ): number {

		const start = road.getStartPosTheta();

		if ( link.element instanceof TvRoad ) {

			const position = link.contactPoint === TvContactPoint.START ? link.element.getStartPosTheta() : link.element.getEndPosTheta();

			return start.distanceTo( position );

		} else if ( link.element instanceof TvJunction ) {

			const point = new Vector2( start.position.x, start.position.y );

			return link.element.boundingBox.distanceToPoint( point );
		}

	}

	static isSuccessor ( segment: TvRoad, nextSegment: TvRoad | TvJunction ) {

		if ( !segment.successor ) return false;

		if ( segment.successor.element != nextSegment ) return false;

		return true;

	}

	static isPredecessor ( segment: TvRoad, nextSegment: TvRoad | TvJunction ) {

		if ( !segment.predecessor ) return false;

		if ( segment.predecessor.element != nextSegment ) return false;

		return true;

	}

	static isRoadLinked ( prev: TvRoad, next: TvRoad ): boolean {

		if ( !prev.successor ) return false;

		if ( !next.predecessor ) return false;

		if ( prev.successor.element != next ) return false;

		if ( next.predecessor.element != prev ) return false;

		return true;

	}

	static divideRoad ( parent: TvRoad, s: number, newRoadId: number ): TvRoad {

		const oldSuccessor = parent.successor;

		const clone = this.clone( parent, s );

		clone.id = newRoadId;

		clone.name = `Road ${ newRoadId }`;

		if ( oldSuccessor?.isRoad ) {

			const nextRoad = oldSuccessor.getElement<TvRoad>();

			nextRoad.setPredecessorRoad( clone, TvContactPoint.END );

		}

		clone.successor = oldSuccessor;

		clone.setPredecessorRoad( parent, TvContactPoint.END );

		this.divideObjects( parent, s, clone );

		this.divideSignals( parent, s, clone );

		return clone;
	}

	static clone ( road: TvRoad, s: number ): TvRoad {

		const clone = road.clone( s );

		// clone will have same id as the original road
		// clone.id = this.roadFactory.getNextRoadId();

		clone.name = `Road ${ clone.id }`;

		// clone.objects.object.forEach( object => object.road = clone );

		clone.sStart = road.sStart + s;

		return clone;

	}

	static divideObjects ( oldRoad: TvRoad, s: number, newRoad: TvRoad ) {

		const objects = oldRoad.objects.object.filter( object => object.s > s );

		objects.forEach( object => {

			object.road = newRoad;

			object.s -= s;

			newRoad.objects.object.push( object );

		} );

		oldRoad.objects.object = oldRoad.objects.object.filter( object => object.s <= s );
	}

	static divideSignals ( oldRoad: TvRoad, s: number, newRoad: TvRoad ) {

		const signals = oldRoad.getRoadSignals().filter( signal => signal.s > s );

		signals.forEach( signal => {

			signal.roadId = newRoad.id;

			signal.s -= s;

			newRoad.addSignal( signal );

			oldRoad.signals.delete( signal.id );

		} );

	}

	static linkSuccessor ( road: TvRoad, successor: TvRoad, successorContact: TvContactPoint ) {

		if ( road.successor ) this.unlinkSuccessor( road );

		if ( successorContact === TvContactPoint.START ) {

			successor.setPredecessorRoad( road, TvContactPoint.END );

		} else if ( successorContact === TvContactPoint.END ) {

			successor.setSuccessorRoad( road, TvContactPoint.END );

		} else {

			throw new Error( "Invalid contact point" );

		}

		road.successor = new TvRoadLink( TvRoadLinkType.ROAD, successor, successorContact );
	}

	static linkPredecessor ( road: TvRoad, predecessor: TvRoad, predecessorContact: TvContactPoint ) {

		if ( road.predecessor ) this.unlinkPredecessor( road );

		if ( predecessorContact === TvContactPoint.END ) {

			predecessor.setSuccessorRoad( road, TvContactPoint.START );

		} else {

			predecessor.setPredecessorRoad( road, TvContactPoint.START );

		}

		road.predecessor = new TvRoadLink( TvRoadLinkType.ROAD, predecessor, predecessorContact );

	}

	static unlinkSuccessor ( road: TvRoad, updateMe = true ) {

		if ( !road.successor ) return;

		if ( road.successor.isJunction ) return;

		const linkedRoad = road.successor.element as TvRoad;

		if ( road.successor.contactPoint === TvContactPoint.START ) {

			linkedRoad.predecessor = null;

		} else {

			linkedRoad.successor = null;

		}

		if ( updateMe ) road.successor = null;
	}

	static unlinkPredecessor ( road: TvRoad, updateMe = true ) {

		if ( !road.predecessor ) return;

		if ( road.predecessor.isJunction ) return;

		const linkedRoad = road.predecessor.element as TvRoad;

		if ( road.predecessor.contactPoint === TvContactPoint.START ) {

			linkedRoad.predecessor = null;

		} else {

			linkedRoad.successor = null;

		}

		if ( updateMe ) road.predecessor = null;
	}

}
