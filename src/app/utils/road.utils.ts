/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvContactPoint } from "app/map/models/tv-common";
import { TvLink, TvLinkType } from "app/map/models/tv-link";
import { TvRoad } from "app/map/models/tv-road.model";
import { TvJunction } from "../map/models/junctions/tv-junction";
import { Vector2, Vector3 } from "three";

export class RoadUtils {

	static distanceFromSuccessor ( road: TvRoad, link: TvLink ): number {

		const end = road.getEndPosTheta();

		if ( link.element instanceof TvRoad ) {

			const position = link.contactPoint === TvContactPoint.START ? link.element.getStartPosTheta() : link.element.getEndPosTheta();

			return end.toVector2().distanceTo( position.toVector2() );

		} else if ( link.element instanceof TvJunction ) {

			const point = new Vector2( end.position.x, end.position.y );

			return link.element.distanceToPoint( point );

		}

	}

	static distanceFromPredecessor ( road: TvRoad, link: TvLink ): number {

		const start = road.getStartPosTheta();

		if ( link.element instanceof TvRoad ) {

			const position = link.contactPoint === TvContactPoint.START ? link.element.getStartPosTheta() : link.element.getEndPosTheta();

			return start.toVector2().distanceTo( position.toVector2() );

		} else if ( link.element instanceof TvJunction ) {

			const point = new Vector2( start.position.x, start.position.y );

			return link.element.distanceToPoint( point );
		}

	}

	static isSuccessor ( segment: TvRoad, nextSegment: TvRoad | TvJunction ): boolean {

		if ( !segment.successor ) return false;

		if ( segment.successor.element != nextSegment ) return false;

		return true;

	}

	static isPredecessor ( segment: TvRoad, nextSegment: TvRoad | TvJunction ): boolean {

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

		const clone = this.clone( parent, s, newRoadId );

		this.divideObjects( parent, s, clone );

		this.divideSignals( parent, s, clone );

		return clone;
	}

	static clone ( road: TvRoad, s: number, id: number ): TvRoad {

		const clone = road.clone( s, id );

		clone.sStart = road.sStart + s;

		return clone;

	}

	static divideObjects ( oldRoad: TvRoad, sOffset: number, newRoad: TvRoad ): void {

		const objects = oldRoad.getRoadObjects();

		oldRoad.clearRoadObjects();

		newRoad.clearRoadObjects();

		objects.filter( object => object.s >= sOffset ).forEach( object => newRoad.addRoadObject( object ) );

		objects.filter( object => object.s < sOffset ).forEach( object => oldRoad.addRoadObject( object ) );

		newRoad.getRoadObjects().forEach( object => object.s = object.s - sOffset );

	}

	static divideSignals ( oldRoad: TvRoad, sOffset: number, newRoad: TvRoad ): void {

		const signals = oldRoad.getRoadSignals();

		oldRoad.clearSignals();

		newRoad.clearSignals();

		signals.filter( object => object.s >= sOffset ).forEach( signal => newRoad.addSignal( signal ) );

		signals.filter( object => object.s < sOffset ).forEach( signal => oldRoad.addSignal( signal ) );

		newRoad.getRoadSignals().forEach( signal => signal.s -= sOffset );

	}

	static unlinkSuccessor ( road: TvRoad, updateMe: boolean = true ): void {

		if ( !road.successor ) return;

		if ( road.successor.isJunction ) return;

		const linkedRoad = road.successor.element as TvRoad;

		if ( road.successor.contactPoint === TvContactPoint.START ) {

			linkedRoad.removePredecessor();

		} else {

			linkedRoad.removeSuccessor();

		}

		if ( updateMe ) road.removeSuccessor();
	}

	static unlinkPredecessor ( road: TvRoad, updateMe: boolean = true ): void {

		if ( !road.predecessor ) return;

		if ( road.predecessor.isJunction ) return;

		const linkedRoad = road.predecessor.element as TvRoad;

		if ( road.predecessor.contactPoint === TvContactPoint.START ) {

			linkedRoad.removePredecessor();

		} else {

			linkedRoad.removeSuccessor();

		}

		if ( updateMe ) road.removePredecessor();
	}

	static getContactByPosition ( road: TvRoad, position: Vector3 ): TvContactPoint {

		const startDistance = road.getRoadPosition( 0 ).position.distanceTo( position );
		const endDistance = road.getRoadPosition( this.length ).position.distanceTo( position );

		if ( startDistance < endDistance ) {

			return TvContactPoint.START;

		} else {

			return TvContactPoint.END;

		}

	}
}
