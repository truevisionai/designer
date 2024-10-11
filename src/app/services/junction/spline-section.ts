import { NewSegment, AbstractSpline } from "app/core/shapes/abstract-spline";
import { Log } from "app/core/utils/log";
import { MapEvents } from "app/events/map-events";
import { RoadRemovedEvent } from "app/events/road/road-removed-event";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvContactPoint } from "app/map/models/tv-common";
import { TvLink } from "app/map/models/tv-link";
import { TvRoad } from "app/map/models/tv-road.model";
import { Assert } from "app/utils/assert";
import { Box2 } from "three";


export abstract class SplineSection {

	protected startSegment: NewSegment;
	protected endSegment: NewSegment;

	constructor (
		public readonly spline: AbstractSpline,
		protected start: number,
		protected end: number
	) {
		this.startSegment = spline.getSegmentAt( start );
		this.endSegment = spline.getSegmentAt( end );
	}

	getLinks ( segment: NewSegment ): TvLink[] {
		return this.spline.getSegmentLinks( segment );
	}

	getLength (): number {
		return this.end - this.start;
	}

	getStart (): number {
		return this.start;
	}

	setStart ( value: number ): void {
		this.start = value;
	}

	getEnd (): number {
		return this.end;
	}

	setEnd ( end: number ): void {
		this.end = end;
	}

	getStartSegment (): NewSegment {
		return this.startSegment;
	}

	getEndSegment (): NewSegment {
		return this.endSegment;
	}

	isAtStart (): boolean {
		return this.start <= 0;
	}

	isAtEnd (): boolean {
		return this.end >= this.spline.getLength();
	}

	isAtMiddle (): boolean {
		return !this.isAtStart() && !this.isAtEnd();
	}

	hasDifferentSegments (): boolean {
		return this.getStartSegment() != this.getEndSegment();
	}

	hasDifferentRoads (): boolean {
		return this.getStartSegment() instanceof TvRoad &&
			this.getEndSegment() instanceof TvRoad &&
			this.getStartSegment() !== this.getEndSegment();
	}

	hasSameSegments (): boolean {
		return !this.hasDifferentSegments();
	}

	shouldCreateRoadSegment (): boolean {
		return this.hasSameSegments() && this.isAtMiddle();
	}

	addRoadSegment ( s: number, segment: NewSegment ): void {
		this.spline.addSegment( s, segment );
	}

	isNearJunction (): boolean {
		return this.startSegment instanceof TvJunction || this.endSegment instanceof TvJunction;
	}

	insertJunctionSegment ( junction: NewSegment ): void {

		if ( this.hasDifferentSegments() ) {

			this.spline.addSegment( this.start, junction );
			this.shiftOrRemoveRoadAfterJunction( junction );

			return;
		}

		if ( this.isAtStart() ) {

			this.shiftRoadSegment( this.getStartSegment() as TvRoad, this.end );
			this.spline.addSegment( this.start, junction );

		} else {

			this.spline.addSegment( this.start, junction );
			this.shiftOrRemoveRoadAfterJunction( junction );

		}

	}

	shiftOrRemoveRoadAfterJunction ( junction: NewSegment ): void {

		if ( !this.hasRoadAfterJunction( junction as TvJunction ) ) return;

		const road = this.endSegment as TvRoad;

		if ( this.end < this.spline.getLength() ) {

			this.shiftRoadSegment( this.endSegment as TvRoad, this.end );

			return;
		}

		this.spline.removeSegment( road );

		this.endSegment = junction;

		MapEvents.roadRemoved.emit( new RoadRemovedEvent( road ) );

	}

	shouldAddRoadAfterJunction ( junction: TvJunction ): boolean {

		return this.isAtMiddle(); //&& this.spline.getNextSegment( junction ) === null;

	}

	shouldRemoveFirstSegment (): boolean {

		if ( this.startSegment instanceof TvRoad && this.endSegment instanceof TvRoad ) {

			return this.startSegment.getLength() <= this.getLength() && this.startSegment.sStart == this.start;

		}

		return false;

	}

	hasRoadAfterJunction ( junction: TvJunction ): boolean {

		return this.spline.getNextSegment( junction ) instanceof TvRoad;

	}

	addRoadAfterSection ( newRoad: TvRoad ): void {

		newRoad.sStart = this.end;

		// we reach this point only if the section is in the middle of the spline
		// so we can safely assume that the start segment is a road
		const existingRoad = this.startSegment instanceof TvRoad ?
			this.startSegment :
			this.spline.getPreviousSegment( this.startSegment ) as TvRoad;

		Assert.isTrue( existingRoad instanceof TvRoad, 'The start segment is not a road' );

		existingRoad.successor?.replace( existingRoad, newRoad, TvContactPoint.END );

		newRoad.linkPredecessor( existingRoad, TvContactPoint.END );

		this.spline.addSegment( this.end, newRoad );

	}

	shiftRoadSegment ( road: TvRoad, offset: number ): void {

		road.sStart = this.end;

		this.spline.shiftSegment( offset, road );

	}

	shiftJunctionAndUpdateSegments ( junction: TvJunction, start?: number, end?: number ): void {

		start = start ?? this.start;

		end = end ?? this.end;

		this.spline.shiftSegment( start, junction );

		this.spline.updateLinks();

		this.spline.updateSegmentGeometryAndBounds();

	}

	clone (): SplineSection {

		return SplineSectionFactory.create( this.spline, this.start, this.end );

	}

	setOffsets ( start: number, end: number ): void {

		this.start = start;
		this.end = end;

	}

	updateOffsetSegments (): void {

		this.startSegment = this.spline.getSegmentAt( this.start );
		this.endSegment = this.spline.getSegmentAt( this.end );

	}

	updateOffsets ( area: Box2 ): void {

		const offsets = this.computeOffsets( area );

		this.setOffsets( offsets.start, offsets.end );

		this.updateOffsetSegments();

	}

	getSegments (): NewSegment[] {

		const segments = new Set<NewSegment>();

		for ( let s = this.start; s <= this.end; s++ ) {

			segments.add( this.spline.getSegmentAt( s ) );

		}

		return [ ...segments ];

	}

	private computeOffsets ( area: Box2 ) {

		const intersectingOffsets = [ this.start, this.end ];

		for ( let s = 0; s < this.spline.getLength(); s++ ) {

			const point = this.spline.getCoordAtOffset( s );

			if ( area.containsPoint( point.toVector2() ) ) {

				intersectingOffsets.push( s );

			}

		}

		return {
			start: Math.min( ...intersectingOffsets ),
			end: Math.max( ...intersectingOffsets )
		};
	}

	abstract insertJunction ( junction: TvJunction ): void;

	abstract updateJunction ( junction: TvJunction ): void;

	protected addOrShiftSegment ( s: number, segment: NewSegment ): void {

		if ( this.spline.hasSegment( segment ) ) {

			this.spline.shiftSegment( s, segment );

		} else {

			this.spline.addSegment( s, segment );

		}

	}

	protected addOrShiftJunction ( s: number, segment: TvJunction ): void {

		if ( this.spline.hasSegment( segment ) ) {

			this.spline.shiftSegmentAndUpdateLinks( s, segment );

		} else {

			this.spline.addSegment( s, segment );

		}

	}

}

export class StartSection extends SplineSection {

	insertJunction ( junction: TvJunction ): void {

		if ( this.startSegment instanceof TvRoad ) {

			this.spline.shiftSegment( this.end, this.startSegment );

		} else if ( this.endSegment instanceof TvRoad ) {

			this.spline.shiftSegment( this.end, this.endSegment );

		} else {

			Log.warn( 'No road segment found' );

		}

		this.addOrShiftJunction( this.start, junction );

		this.spline.updateLinks();

		this.spline.updateSegmentGeometryAndBounds();

	}

	updateJunction ( junction: TvJunction ): void {

		this.insertJunction( junction );

	}

	shouldAddRoadAfterJunction ( junction: TvJunction ): boolean {

		return false;

	}

}

export class MiddleSection extends SplineSection {

	insertJunction ( junction: TvJunction ): void {

		if ( this.endSegment instanceof TvRoad && this.endSegment != this.startSegment ) {

			this.spline.shiftSegment( this.end, this.endSegment );

		} else if ( this.hasRoadAfterJunction( junction ) ) {

			this.spline.shiftSegment( this.end, this.spline.getNextSegment( junction ) );

		}

		this.addOrShiftJunction( this.start, junction );

		this.insertRoadAfterJunction( junction );

		this.spline.updateLinks();

		this.spline.updateSegmentGeometryAndBounds();

	}

	updateJunction ( junction: TvJunction ): void {

		this.insertJunction( junction );

		this.insertRoadBeforeJunction( junction );

	}

	removeJunctionSegment ( junction: TvJunction ): void {

		const previousSegment = this.spline.getPreviousSegment( junction );
		const nextSegment = this.spline.getNextSegment( junction );

		if ( previousSegment instanceof TvRoad ) {
			previousSegment.successor?.unlink( previousSegment, TvContactPoint.END );
		}

		if ( nextSegment instanceof TvRoad ) {
			nextSegment.predecessor?.unlink( nextSegment, TvContactPoint.START );
		}

		this.spline.removeSegment( junction );
	}

	private insertRoadAfterJunction ( junction: TvJunction ): void {

		if ( !this.shouldAddRoadAfterJunction( junction ) ) return;

		const existingRoad = this.startSegment as TvRoad;

		const id = this.spline.getMap().generateRoadId();

		const roadAfterJunction = existingRoad?.clone( 0, id );

		// set the successor and predecessor to null to avoid linking the road to the junction
		roadAfterJunction.predecessor = roadAfterJunction.successor = null;

		const roadBeforeJunction = this.spline.getPreviousSegment( junction ) as TvRoad;

		this.spline.getMap().addRoad( roadAfterJunction );

		this.spline.addSegment( this.end, roadAfterJunction );

		roadBeforeJunction.successor?.replace( roadBeforeJunction, roadAfterJunction, TvContactPoint.END );

	}

	private insertRoadBeforeJunction ( junction: TvJunction ): void {

		if ( !this.shouldAddRoadBeforeJunction( junction ) ) return;

		const existingRoad = this.endSegment as TvRoad;

		const id = this.spline.getMap().generateRoadId();

		const roadBeforeJunction = existingRoad?.clone( 0, id );

		// set the successor and predecessor to null to avoid linking the road to the junction
		roadBeforeJunction.predecessor = roadBeforeJunction.successor = null;

		this.spline.getMap().addRoad( roadBeforeJunction );

		this.spline.addSegment( 0, roadBeforeJunction );

	}

	shouldAddRoadAfterJunction ( junction: TvJunction ): boolean {

		return this.isAtMiddle() && !this.hasRoadAfterJunction( junction );

	}

	shouldAddRoadBeforeJunction ( junction: TvJunction ): boolean {

		return this.isAtMiddle() && !this.hasRoadBeforeJunction( junction );

	}

	hasRoadBeforeJunction ( junction: TvJunction ): boolean {

		return this.spline.getPreviousSegment( junction ) instanceof TvRoad;

	}

}

export class EndSection extends SplineSection {

	insertJunction ( junction: TvJunction ): void {

		this.addOrShiftJunction( this.start, junction );

		this.spline.updateLinks();

		this.spline.updateSegmentGeometryAndBounds();

	}

	updateJunction ( junction: TvJunction ): void {

		this.removeSegmentAfterJunction( junction );

		this.insertJunction( junction );

	}

	removeSegmentAfterJunction ( junction: TvJunction ): void {

		const roadBeforeJunction = this.spline.getPreviousSegment( junction ) as TvRoad;

		const roadAfterJunction = this.spline.getNextSegment( junction ) as TvRoad;

		if ( !this.shouldRemoveRoadAfterJunction( roadAfterJunction, roadBeforeJunction ) ) return;

		roadAfterJunction.successor?.replace( roadAfterJunction, roadBeforeJunction, TvContactPoint.END );

		this.spline.removeSegment( roadAfterJunction );

		this.spline.getMap().removeRoad( roadAfterJunction );

		MapEvents.removeMesh.emit( roadAfterJunction );

	}

	shouldRemoveRoadAfterJunction ( roadBeforeJunction: NewSegment, roadAfterJunction: NewSegment ): boolean {

		if ( roadAfterJunction == null ) return false;

		if ( roadBeforeJunction == null ) return false;

		if ( roadBeforeJunction == roadAfterJunction ) return false;

		return true;

	}

	shouldAddRoadAfterJunction ( junction: TvJunction ): boolean {

		return false;

	}

}

export class SplineSectionFactory {

	static create ( spline: AbstractSpline, start: number, end: number ): SplineSection {

		if ( start == 0 ) {
			return new StartSection( spline, start, end );
		}

		if ( end == spline.getLength() ) {
			return new EndSection( spline, start, end );
		}

		return new MiddleSection( spline, start, end );
	}

}
