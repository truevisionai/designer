import { OrderedMap } from 'app/core/models/ordered-map';
import { AbstractSpline, NewSegment } from 'app/core/shapes/abstract-spline';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvContactPoint } from 'app/map/models/tv-common';
import { TvRoad } from 'app/map/models/tv-road.model';
import { SplineUtils } from 'app/utils/spline.utils';
import { RoadService } from 'app/services/road/road.service';
import { RoadFactory } from 'app/factories/road-factory.service';
import { MapService } from 'app/services/map/map.service';
import { MapEvents } from 'app/events/map-events';
import { TvJunctionConnection } from 'app/map/models/junctions/tv-junction-connection';

export class JunctionInserter {

	constructor (
		private spline: AbstractSpline,
		private roadService: RoadService,
		private roadFactory: RoadFactory,
		private mapService: MapService,
	) {
	}

	public insertJunction ( junctionStart: number, junctionEnd: number, newJunction: TvJunction ): void {

		const temp = new OrderedMap<NewSegment>();

		let inserted = false;

		const segments = Array.from( this.spline.segmentMap.entries() );

		for ( let i = 0; i < segments.length; i++ ) {
			const [ currentOffset, currentSegment ] = segments[ i ];
			const nextOffset = ( i < segments.length - 1 ) ? segments[ i + 1 ][ 0 ] : this.spline.getLength();
			const previousSegment = ( i > 0 ) ? segments[ i - 1 ][ 1 ] : null;

			if ( !inserted && junctionStart <= currentOffset ) {
				this.insertNewJunction( temp, junctionStart, junctionEnd, newJunction, currentOffset, nextOffset, currentSegment, previousSegment );
				inserted = true;
			}

			this.handleExistingSegment( temp, inserted, currentOffset, junctionEnd, nextOffset, currentSegment );
		}

		if ( !inserted ) {
			this.insertJunctionAtEnd( temp, junctionStart, junctionEnd, newJunction );
		}

		this.updateSplineSegments( temp );
	}

	private insertNewJunction ( temp: OrderedMap<NewSegment>, junctionStart: number, junctionEnd: number,
		newJunction: TvJunction, currentOffset: number, nextOffset: number,
		currentSegment: NewSegment, previousSegment: NewSegment | null ): void {
		temp.set( junctionStart, newJunction );

		if ( currentSegment instanceof TvJunction && junctionEnd < currentOffset ) {
			this.handleJunctionOverlap( temp, junctionEnd, previousSegment, currentSegment );
		}

		if ( currentSegment instanceof TvRoad && junctionEnd < currentOffset ) {
			temp.set( junctionEnd, currentSegment );
		}

		if ( currentSegment instanceof TvRoad && junctionEnd >= nextOffset ) {
			this.roadService.remove( currentSegment );
		}
	}

	private handleJunctionOverlap (
		temp: OrderedMap<NewSegment>,
		junctionEnd: number,
		previousSegment: NewSegment | null,
		junction: TvJunction
	): void {
		if ( previousSegment instanceof TvRoad ) {
			this.removeConnectionRoadAndSplines( junction, junction.getConnectionsByRoad( previousSegment ) );
			junction.needsUpdate = true;
		}
		temp.set( junctionEnd, this.createNewRoad( this.spline, junctionEnd ) );
	}

	private handleExistingSegment ( temp: OrderedMap<NewSegment>, inserted: boolean, currentOffset: number,
		junctionEnd: number, nextOffset: number, currentSegment: NewSegment ): void {
		if ( inserted && currentOffset < junctionEnd ) {
			currentOffset = junctionEnd;
		}

		if ( currentOffset < nextOffset ) {
			temp.set( currentOffset, currentSegment );
		}
	}

	private insertJunctionAtEnd ( temp: OrderedMap<NewSegment>, junctionStart: number, junctionEnd: number, newJunction: TvJunction ): void {
		temp.set( junctionStart, newJunction );

		if ( junctionEnd < this.spline.getLength() ) {
			this.handleEndJunction( temp, junctionEnd, newJunction );
		}
	}

	private handleEndJunction ( temp: OrderedMap<NewSegment>, junctionEnd: number, newJunction: TvJunction ): void {
		const previousKey = temp.getPreviousKey( newJunction );
		const previousSegment = temp.getPrevious( newJunction );
		const successor = this.spline.getSuccessor();

		if ( previousSegment instanceof TvRoad && successor instanceof TvJunction ) {
			this.handleEndJunctionWithRoadAndSuccessor( temp, junctionEnd, previousKey, previousSegment, successor );
		} else {
			this.handleEndJunctionWithoutRoadOrSuccessor( temp, junctionEnd );
		}
	}

	private handleEndJunctionWithRoadAndSuccessor ( temp: OrderedMap<NewSegment>, junctionEnd: number,
		previousKey: number, previousSegment: TvRoad, successor: TvJunction ): void {
		successor.needsUpdate = true;
		const newRoad = this.createNewRoad( this.spline, junctionEnd );
		temp.set( previousKey, newRoad );
		temp.set( junctionEnd, previousSegment );
		previousSegment.predecessor?.replace( previousSegment, newRoad, TvContactPoint.START );
	}

	private handleEndJunctionWithoutRoadOrSuccessor ( temp: OrderedMap<NewSegment>, junctionEnd: number ): void {
		const newRoad = this.createNewRoad( this.spline, junctionEnd );
		temp.set( junctionEnd, newRoad );
		this.spline.getSuccessorLink()?.setSuccessor( newRoad );
	}

	private updateSplineSegments ( temp: OrderedMap<NewSegment> ): void {
		this.spline.segmentMap.clear();
		temp.forEach( ( segment, sOffset ) => {
			SplineUtils.addSegment( this.spline, sOffset, segment );
		} );
	}

	private createNewRoad ( spline: AbstractSpline, startOffset: number ): TvRoad {
		// Implement logic to create a new road
		const firstRoad = spline.getRoadSegments()[ 0 ];

		const newRoad = this.roadService.clone( firstRoad, 0 );

		newRoad.sStart = startOffset;

		this.mapService.map.addRoad( newRoad );

		newRoad.successor = newRoad.predecessor = null;

		return newRoad;
	}

	private removeConnectionRoadAndSplines ( junction: TvJunction, connections: TvJunctionConnection[] ): void {

		for ( const connection of connections ) {

			this.mapService.removeRoad( connection.connectingRoad );

			this.mapService.removeSpline( connection.connectingRoad.spline );

			MapEvents.removeMesh.emit( connection.connectingRoad );

			MapEvents.removeMesh.emit( connection.connectingRoad.spline );

			junction.removeConnection( connection );

		};

	}
}
