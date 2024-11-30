import { TvJunction } from "app/map/models/junctions/tv-junction";
import { LinkFactory } from "app/map/models/link-factory";
import { TvContactPoint } from "app/map/models/tv-common";
import { TvLink } from "app/map/models/tv-link";
import { TvRoad } from "app/map/models/tv-road.model";
import { SplineUtils } from "app/utils/spline.utils";
import { Log } from "../utils/log";
import { AbstractSpline, NewSegment } from "./abstract-spline";

export class SplineLinks {

	constructor ( private spline: AbstractSpline ) { }

	updateLinks (): void {
		SplineUtils.updateInternalLinks( this.spline );
	}

	getSegmentLinks ( segment: NewSegment ): TvLink[] {

		const links = [];

		const prev = this.spline.getPreviousSegment( segment );
		const next = this.spline.getNextSegment( segment );

		if ( prev instanceof TvRoad ) {
			links.push( LinkFactory.createRoadLink( prev, TvContactPoint.END ) );
		}

		if ( next instanceof TvRoad ) {
			links.push( LinkFactory.createRoadLink( next, TvContactPoint.START ) );
		}

		return links;
	}

	removeSegmentAndReplaceLinks ( segment: NewSegment ): void {

		if ( segment instanceof TvRoad ) {

			this.removeRoadSegment( segment );

		} else if ( segment instanceof TvJunction ) {

			this.removeJunctionSegment( segment );

		}

		this.updateLinks();

		this.spline.updateSegmentGeometryAndBounds();

	}

	private removeRoadSegment ( road: TvRoad ): void {

		const previousSegment = this.spline.getPreviousSegment( road );
		const nextSegment = this.spline.getNextSegment( road );

		if ( previousSegment instanceof TvRoad ) {
			previousSegment.removeSuccessor();
		}

		if ( nextSegment instanceof TvRoad ) {
			nextSegment.removePredecessor();
		}

		if ( this.spline.hasSegment( road ) ) {
			this.spline.removeSegment( road );
		} else {
			Log.warn( 'Segment not found in spline', road.toString(), this.toString() );
		}

	}

	private removeJunctionSegment ( junction: TvJunction ): void {

		const previousSegment = this.spline.getPreviousSegment( junction );
		const nextSegment = this.spline.getNextSegment( junction );

		if ( previousSegment instanceof TvRoad ) {
			previousSegment.removeSuccessor()
		}

		if ( nextSegment instanceof TvRoad ) {
			nextSegment.removePredecessor();
		}

		if ( this.spline.hasSegment( junction ) ) {
			this.spline.removeSegment( junction );
		} else {
			Log.warn( 'Segment not found in spline', junction.toString(), this.toString() );
		}

	}
}
