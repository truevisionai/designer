/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline, NewSegment } from "../../core/shapes/abstract-spline";
import { DepAutoSpline } from "../../core/shapes/auto-spline";
import { AutoSpline } from "../../core/shapes/auto-spline-v2";
import { ExplicitSpline } from "../../core/shapes/explicit-spline";
import { RoadControlPoint } from "../../objects/road/road-control-point";
import { TvRoad } from "../models/tv-road.model";
import { SplineSegmentType } from "../../core/shapes/spline-segment";
import { TvJunction } from "../models/junctions/tv-junction";
import { GeometryExporter } from "./geometry-exporter";
import { Injectable } from "@angular/core";

@Injectable( {
	providedIn: 'root'
} )
export class SplineExporter {

	constructor (
		private geometryExporter: GeometryExporter
	) {
	}

	export ( spline: AbstractSpline ): Record<string, any> {

		if ( spline instanceof DepAutoSpline ) {

			return this.exportDepAutoSpline( spline );

		} else if ( spline instanceof AutoSpline ) {

			return this.exportAutoSpline( spline )

		} else if ( spline instanceof ExplicitSpline ) {

			return this.exportExplicitSpline( spline );

		} else {

			throw new Error( `Unknown spline type:${ spline.type }` );

		}

	}


	private exportExplicitSpline ( spline: ExplicitSpline ): Record<string, any> {
		return {
			attr_uuid: spline.uuid,
			attr_type: spline.type,
			geometry: spline.getGeometries().map( geometry => this.geometryExporter.export( geometry ) ),
			point: spline.controlPoints.map( ( point: RoadControlPoint ) => ( {
				attr_x: point.position.x,
				attr_y: point.position.y,
				attr_z: point.position.z,
				attr_hdg: point.hdg
			} ) ),
			roadSegment: this.exportSegments( spline )
		};
	}

	private exportAutoSpline ( spline: AutoSpline ): Record<string, any> {
		return {
			attr_uuid: spline.uuid,
			attr_type: spline.type,
			point: spline.controlPointPositions.map( point => ( {
				attr_x: point.x,
				attr_y: point.y,
				attr_z: point.z
			} ) ),
			roadSegment: this.exportSegments( spline ),
		};

	}

	private exportDepAutoSpline ( spline: DepAutoSpline ): Record<string, any> {
		return {
			attr_uuid: spline.uuid,
			attr_type: spline.type,
			point: spline.controlPointPositions.map( point => ( {
				attr_x: point.x,
				attr_y: point.y,
				attr_z: point.z
			} ) ),
			roadSegment: this.exportSegments( spline )
		};
	}

	private exportSegments ( spline: AbstractSpline ): any[] {

		const nodes = [];

		spline.forEachSegment( ( segment, s ) => {
			nodes.push( {
				attr_start: s,
				attr_id: segment?.id,
				attr_type: this.exportSegmentType( segment )
			} );
		} );

		return nodes;
	}

	private exportSegmentType ( segment: NewSegment ): string {
		if ( segment instanceof TvRoad ) {
			return SplineSegmentType.ROAD;
		} else if ( segment instanceof TvJunction ) {
			return SplineSegmentType.JUNCTION;
		} else {
			return null;
		}
	}

}
