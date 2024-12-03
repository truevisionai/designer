import { NewSegment, AbstractSpline } from "app/core/shapes/abstract-spline";
import { Log } from "app/core/utils/log";
import { MapEvents } from "app/events/map-events";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvContactPoint } from "app/map/models/tv-common";
import { TvLink } from "app/map/models/tv-link";
import { TvRoad } from "app/map/models/tv-road.model";
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

	isNearJunction (): boolean {
		return this.startSegment instanceof TvJunction || this.endSegment instanceof TvJunction;
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

	private computeOffsets ( area: Box2 ): any {

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

	protected addOrShiftJunction ( s: number, segment: TvJunction ): void {

		if ( this.spline.hasSegment( segment ) ) {

			this.spline.shiftSegmentAndUpdateLinks( s, segment );

		} else {

			this.spline.addSegment( s, segment );

		}

	}

	protected removeSegmentAfterJunction ( junction: TvJunction ): void {

		const roadBeforeJunction = this.spline.getPreviousSegment( junction ) as TvRoad;

		const roadAfterJunction = this.spline.getNextSegment( junction ) as TvRoad;

		if ( !this.shouldRemoveRoadAfterJunction( junction ) ) return;

		roadAfterJunction.successor?.replace( roadAfterJunction, roadBeforeJunction, TvContactPoint.END );

		this.spline.removeSegment( roadAfterJunction );

		this.spline.getMap().removeRoad( roadAfterJunction );

		MapEvents.removeMesh.emit( roadAfterJunction );

	}

	protected shouldRemoveRoadAfterJunction ( junction: TvJunction ): boolean {

		const roadBeforeJunction = this.spline.getPreviousSegment( junction ) as TvRoad;

		const roadAfterJunction = this.spline.getNextSegment( junction ) as TvRoad;

		if ( roadAfterJunction == null ) return false;

		if ( roadBeforeJunction == null ) return false;

		if ( roadBeforeJunction == roadAfterJunction ) return false;

		return true;

	}

	protected addRoadAfterJunction ( junction: TvJunction ): void {

		if ( !this.shouldAddRoadAfterJunction( junction ) ) return;

		const existingRoad = this.startSegment as TvRoad;

		const id = this.spline.getMap().generateRoadId();

		const roadAfterJunction = existingRoad?.clone( 0, id );

		// set the successor and predecessor to null to avoid linking the road to the junction
		roadAfterJunction.removeLinks();

		const roadBeforeJunction = this.spline.getPreviousSegment( junction ) as TvRoad;

		this.spline.getMap().addRoad( roadAfterJunction );

		this.spline.addSegment( this.end, roadAfterJunction );

		roadBeforeJunction.successor?.replace( roadBeforeJunction, roadAfterJunction, TvContactPoint.END );

	}

	protected addRoadBeforeJunction ( junction: TvJunction ): void {

		if ( !this.shouldAddRoadBeforeJunction( junction ) ) return;

		const existingRoad = this.endSegment as TvRoad;

		const id = this.spline.getMap().generateRoadId();

		const roadBeforeJunction = existingRoad?.clone( 0, id );

		// set the successor and predecessor to null to avoid linking the road to the junction
		roadBeforeJunction.removeLinks();

		this.spline.getMap().addRoad( roadBeforeJunction );

		this.spline.addSegment( 0, roadBeforeJunction );

	}

	protected shouldAddRoadAfterJunction ( junction: TvJunction ): boolean {

		return this.isAtMiddle() && !this.hasRoadAfterJunction( junction );

	}

	protected shouldAddRoadBeforeJunction ( junction: TvJunction ): boolean {

		return this.isAtMiddle() && !this.hasRoadBeforeJunction( junction );

	}

	protected hasRoadBeforeJunction ( junction: TvJunction ): boolean {

		return this.spline.getPreviousSegment( junction ) instanceof TvRoad;

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

}

export class MiddleSection extends SplineSection {

	insertJunction ( junction: TvJunction ): void {

		if ( this.endSegment instanceof TvRoad && this.endSegment != this.startSegment ) {

			this.spline.shiftSegment( this.end, this.endSegment );

		} else if ( this.hasRoadAfterJunction( junction ) ) {

			this.spline.shiftSegment( this.end, this.spline.getNextSegment( junction ) );

		}

		this.addOrShiftJunction( this.start, junction );

		this.addRoadAfterJunction( junction );

		this.spline.updateLinks();

		this.spline.updateSegmentGeometryAndBounds();

	}

	updateJunction ( junction: TvJunction ): void {

		this.insertJunction( junction );

		this.addRoadBeforeJunction( junction );

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

}

export class SplineSectionFactory {

	static createFromSegment ( spline: AbstractSpline, segment: NewSegment ): SplineSection {

		const { start, end } = spline.getSegmentStartEnd( segment );

		return SplineSectionFactory.create( spline, start, end );

	}

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
