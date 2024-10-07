import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvContactPoint } from 'app/map/models/tv-common';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadService } from 'app/services/road/road.service';
import { RoadFactory } from 'app/factories/road-factory.service';
import { MapService } from 'app/services/map/map.service';
import { MapEvents } from 'app/events/map-events';
import { TvJunctionConnection } from 'app/map/models/junctions/tv-junction-connection';
import { SplineSection } from 'app/services/junction/spline-intersection';

export class JunctionInserter {

	constructor (
		private spline: AbstractSpline,
		private roadService: RoadService,
		private roadFactory: RoadFactory,
		private mapService: MapService,
	) { }

	public insertJunction ( sStart: number, sEnd: number, junction: TvJunction ): void {

		const section = new SplineSection( this.spline, sStart, sEnd );

		this.shiftStartingSegmentIfNeeded( section );

		if ( section.hasDifferentRoads() ) {

			this.insertJunctionForDifferentRoads( section, junction );

		} else if ( section.isAtStart() ) {

			this.insertJunctionAtStart( section, junction );

		} else if ( section.isAtEnd() ) {

			this.insertJunctionAtEnd( section, junction );

		} else if ( section.isAtMiddle() ) {

			this.insertJunctionAtMiddle( section, junction );

		}

	}

	insertJunctionForDifferentRoads ( section: SplineSection, junction: TvJunction ): void {

		const roadBeforeJunction = section.getStartSegment() as TvRoad;

		const roadAfterJunction = section.getEndSegment() as TvRoad;

		if ( section.spline.hasSegment( junction ) ) {

			section.spline.shiftSegment( section.getStart(), junction );

		} else {

			section.spline.addSegment( section.getStart(), junction );

		}

		section.spline.shiftSegment( section.getEnd(), roadAfterJunction );

		roadBeforeJunction.linkJunction( junction, TvContactPoint.END );

		roadAfterJunction.linkJunction( junction, TvContactPoint.START );

		section.spline.updateLinks();

		section.spline.updateSegmentGeometryAndBounds();

	}

	insertJunctionAtMiddle ( section: SplineSection, junction: TvJunction ): void {

		const segmentAtStart = section.getStartSegment();

		const roadAfterJunction = this.createOrGetRoadAfterJunction( section );

		if ( section.spline.hasSegment( junction ) ) {

			section.spline.shiftSegment( section.getStart(), junction );

		} else {

			section.spline.addSegment( section.getStart(), junction );

		}

		if ( segmentAtStart instanceof TvRoad ) {

			this.linkRoads( section, segmentAtStart, roadAfterJunction, junction );

		} else {

			throw new Error( 'Segment at start is not a road' );

		}

	}

	linkRoads ( section: SplineSection, roadBeforeJunction: TvRoad, roadAfterJunction: TvRoad, junction: TvJunction ): void {

		if ( section.spline.hasSegment( junction ) ) {

			section.spline.shiftSegment( section.getStart(), junction );

		} else {

			section.spline.addSegment( section.getStart(), junction );

		}

		if ( section.spline.hasSegment( roadAfterJunction ) ) {

			section.spline.shiftSegment( section.getEnd(), roadAfterJunction );

		} else {

			section.spline.addSegment( section.getEnd(), roadAfterJunction );

		}

		roadBeforeJunction.successor?.replace( roadBeforeJunction, roadAfterJunction, TvContactPoint.END );

		roadBeforeJunction.linkJunction( junction, TvContactPoint.END );

		roadAfterJunction.linkJunction( junction, TvContactPoint.START );

		section.spline.updateLinks();

		section.spline.updateSegmentGeometryAndBounds();

	}

	insertJunctionAtEnd ( section: SplineSection, junction: TvJunction ): void {

		const segmentAtEnd = section.getEndSegment();

		if ( segmentAtEnd instanceof TvRoad ) {

			const successor = segmentAtEnd.successor?.clone();

			successor?.unlink( segmentAtEnd, TvContactPoint.START );

			section.spline.addSegment( section.getStart(), junction );

			section.spline.updateLinks();

			section.spline.updateSegmentGeometryAndBounds();

		} else {

			throw new Error( 'Segment at end is not a road' );

		}

	}

	insertJunctionAtStart ( section: SplineSection, junction: TvJunction ): void {

		const segmentAtStart = section.getStartSegment();

		if ( segmentAtStart instanceof TvRoad || segmentAtStart == null ) {

			section.spline.addSegment( section.getStart(), junction );

			section.spline.updateLinks();

			section.spline.updateSegmentGeometryAndBounds();

		} else {

			throw new Error( 'Segment at start is not a road' );

		}

	}

	private createOrGetRoadAfterJunction ( section: SplineSection ): TvRoad {

		if ( section.hasDifferentRoads() ) {
			return section.getEndSegment() as TvRoad;
		}

		const firstRoad = section.spline.getRoadSegments()[ 0 ];

		const newRoad = this.roadService.clone( firstRoad, 0 );

		newRoad.sStart = section.getEnd();

		this.mapService.map.addRoad( newRoad );

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

	private shiftStartingSegmentIfNeeded ( section: SplineSection ): void {

		if ( section.hasDifferentRoads() ) {

			const segmentAtStart = section.getStartSegment() as TvRoad;
			const segmentAtEnd = section.getEndSegment() as TvRoad;

			if ( section.shouldRemoveFirstSegment() ) {

				segmentAtStart.predecessor?.replace( segmentAtStart, segmentAtEnd, TvContactPoint.START );

				section.spline.removeSegment( segmentAtStart );

				section.spline.shiftSegment( section.getEnd(), segmentAtEnd );

				this.mapService.removeRoad( segmentAtStart );

			} else {

				section.spline.shiftSegment( section.getEnd(), section.getEndSegment() );

			}


		} else if ( section.isAtStart() && section.getStartSegment() instanceof TvRoad ) {

			section.spline.shiftSegment( section.getEnd(), section.getStartSegment() );

		}

	}

}


// export class JunctionInserter {

// 	constructor (
// 		private spline: AbstractSpline,
// 		private roadService: RoadService,
// 		private roadFactory: RoadFactory,
// 		private mapService: MapService,
// 	) {
// 	}

// 	public insertJunction ( sStart: number, sEnd: number, newJunction: TvJunction ): void {

// 		const section = new SplineSection( this.spline, sStart, sEnd );

// 		const temp = new OrderedMap<NewSegment>();

// 		let inserted = false;

// 		const segments = Array.from( this.spline.segmentMap.entries() );

// 		for ( let i = 0; i < segments.length; i++ ) {

// 			const [ currentOffset, currentSegment ] = segments[ i ];

// 			const nextOffset = ( i < segments.length - 1 ) ? segments[ i + 1 ][ 0 ] : this.spline.getLength();

// 			const previousSegment = ( i > 0 ) ? segments[ i - 1 ][ 1 ] : null;

// 			if ( !inserted && sStart <= currentOffset ) {

// 				this.insertNewJunction( temp, section, newJunction, currentOffset, nextOffset, currentSegment, previousSegment );

// 				inserted = true;

// 			}

// 			this.handleExistingSegment( temp, inserted, currentOffset, sEnd, nextOffset, currentSegment );

// 		}

// 		if ( !inserted ) {
// 			this.insertJunctionNearEnd( temp, section, newJunction );
// 		}

// 		this.moveSegmentsFromTemporaryMap( temp );
// 	}

// 	private insertNewJunction (
// 		temp: OrderedMap<NewSegment>,
// 		section: SplineSection,
// 		newJunction: TvJunction,
// 		currentOffset: number,
// 		nextOffset: number,
// 		currentSegment: NewSegment,
// 		previousSegment: NewSegment | null ): void {

// 		temp.set( section.getStart(), newJunction );

// 		if ( currentSegment instanceof TvJunction && section.getEnd() < currentOffset ) {
// 			this.handleJunctionOverlap( temp, section, previousSegment, currentSegment );
// 		}

// 		if ( currentSegment instanceof TvRoad && section.getEnd() < currentOffset ) {
// 			section.shiftRoadSegment( currentSegment, currentOffset );
// 		}

// 		if ( currentSegment instanceof TvRoad && section.getEnd() >= nextOffset ) {
// 			this.roadService.remove( currentSegment );
// 		}
// 	}

// 	private handleJunctionOverlap (
// 		temp: OrderedMap<NewSegment>,
// 		section: SplineSection,
// 		previousSegment: NewSegment | null,
// 		junction: TvJunction
// 	): void {

// 		if ( previousSegment instanceof TvRoad ) {
// 			this.removeConnectionRoadAndSplines( junction, junction.getConnectionsByRoad( previousSegment ) );
// 			junction.needsUpdate = true;
// 		}

// 		temp.set( section.getEnd(), this.createNewRoad( this.spline, section.getEnd() ) );

// 	}

// 	private handleExistingSegment (
// 		temp: OrderedMap<NewSegment>,
// 		inserted: boolean,
// 		currentOffset: number,
// 		sEnd: number,
// 		nextOffset: number,
// 		currentSegment: NewSegment
// 	): void {

// 		if ( inserted && currentOffset < sEnd ) {
// 			currentOffset = sEnd;
// 		}

// 		if ( currentOffset < nextOffset ) {
// 			temp.set( currentOffset, currentSegment );
// 		}
// 	}

// 	private insertJunctionNearEnd ( temp: OrderedMap<NewSegment>, section: SplineSection, junction: TvJunction ): void {

// 		temp.set( section.getStart(), junction );

// 		if ( section.getEnd() >= this.spline.getLength() ) {
// 			return;
// 		}

// 		const previousKey = temp.getPreviousKey( junction );
// 		const previousSegment = temp.getPrevious( junction );
// 		const successor = this.spline.getSuccessor();

// 		if ( previousSegment instanceof TvRoad && successor instanceof TvJunction ) {

// 			this.handleEndJunctionWithRoadAndSuccessor( temp, section.getEnd(), previousKey, previousSegment, successor );

// 		} else {

// 			this.createAndAddRoadAtEnd( temp, section.getEnd() );

// 		}

// 	}

// 	private handleEndJunctionWithRoadAndSuccessor (
// 		temp: OrderedMap<NewSegment>,
// 		sEnd: number,
// 		previousKey: number,
// 		previousSegment: TvRoad,
// 		junction: TvJunction
// 	): void {

// 		junction.needsUpdate = true;

// 		const newRoad = this.createNewRoad( this.spline, sEnd );

// 		temp.set( previousKey, newRoad );

// 		temp.set( sEnd, previousSegment );

// 		previousSegment.predecessor?.replace( previousSegment, newRoad, TvContactPoint.START );

// 	}

// 	private createAndAddRoadAtEnd ( temp: OrderedMap<NewSegment>, sEnd: number ): void {

// 		const newRoad = this.createNewRoad( this.spline, sEnd );

// 		temp.set( sEnd, newRoad );

// 		this.spline.getSuccessorLink()?.setSuccessor( newRoad );

// 	}

// 	private moveSegmentsFromTemporaryMap ( temp: OrderedMap<NewSegment> ): void {

// 		this.spline.segmentMap.clear();

// 		temp.forEach( ( segment, sOffset ) => {

// 			this.spline.addSegment( sOffset, segment );

// 		} );

// 	}

// 	private createNewRoad ( spline: AbstractSpline, startOffset: number ): TvRoad {

// 		const firstRoad = spline.getRoadSegments()[ 0 ];

// 		const newRoad = this.roadService.clone( firstRoad, 0 );

// 		newRoad.sStart = startOffset;

// 		this.mapService.map.addRoad( newRoad );

// 		newRoad.successor = newRoad.predecessor = null;

// 		return newRoad;
// 	}

// 	private removeConnectionRoadAndSplines ( junction: TvJunction, connections: TvJunctionConnection[] ): void {

// 		for ( const connection of connections ) {

// 			this.mapService.removeRoad( connection.connectingRoad );

// 			this.mapService.removeSpline( connection.connectingRoad.spline );

// 			MapEvents.removeMesh.emit( connection.connectingRoad );

// 			MapEvents.removeMesh.emit( connection.connectingRoad.spline );

// 			junction.removeConnection( connection );

// 		};

// 	}
// }
