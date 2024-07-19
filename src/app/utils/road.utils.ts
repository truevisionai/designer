import { TvContactPoint } from "app/map/models/tv-common";
import { TvRoadLink, TvRoadLinkType } from "app/map/models/tv-road-link";
import { TvRoad } from "app/map/models/tv-road.model";

export class RoadUtils {

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

	static linkSuccessor ( road: TvRoad, successor: TvRoad, contactPoint: TvContactPoint ) {

		if ( road.successor ) this.unlinkSuccessor( road );

		if ( contactPoint === TvContactPoint.START ) {

			successor.setPredecessorRoad( road, TvContactPoint.START );

		} else {

			successor.setPredecessorRoad( road, TvContactPoint.END );

		}

		road.successor = new TvRoadLink( TvRoadLinkType.ROAD, successor, contactPoint );
	}

	static linkPredecessor ( road: TvRoad, predecessor: TvRoad, contactPoint: TvContactPoint ) {

		if ( road.predecessor ) this.unlinkPredecessor( road );

		if ( contactPoint === TvContactPoint.START ) {

			predecessor.setSuccessorRoad( road, TvContactPoint.START );

		} else {

			predecessor.setSuccessorRoad( road, TvContactPoint.END );

		}

		road.predecessor = new TvRoadLink( TvRoadLinkType.ROAD, predecessor, contactPoint );

	}

	static unlinkSuccessor ( road: TvRoad ) {

		if ( !road.successor ) return;

		if ( road.successor.isJunction ) return;

		const linkedRoad = road.successor.element as TvRoad;

		if ( road.successor.contactPoint === TvContactPoint.START ) {

			linkedRoad.predecessor = null;

		} else {

			linkedRoad.successor = null;

		}

		road.successor = null;
	}

	static unlinkPredecessor ( road: TvRoad ) {

		if ( !road.predecessor ) return;

		if ( road.predecessor.isJunction ) return;

		const linkedRoad = road.predecessor.element as TvRoad;

		if ( road.predecessor.contactPoint === TvContactPoint.START ) {

			linkedRoad.predecessor = null;

		} else {

			linkedRoad.successor = null;

		}

		road.predecessor = null;
	}

}
