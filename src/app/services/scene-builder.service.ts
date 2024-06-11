/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvMap } from 'app/map/models/tv-map.model';
import { TvRoad } from 'app/map/models/tv-road.model';
import { AbstractSpline, SplineType } from 'app/core/shapes/abstract-spline';
import { TvConsole } from 'app/core/utils/console';
import { RoadObjectService } from 'app/map/road-object/road-object.service';
import { RoadSignalService } from '../map/road-signal/road-signal.service';
import { PropCurve } from 'app/map/prop-curve/prop-curve.model';
import { PropPolygon } from 'app/map/prop-polygon/prop-polygon.model';
import { SurfaceBuilder } from 'app/map/surface/surface.builder';
import { SceneService } from './scene.service';
import { PropPolygonService } from "../map/prop-polygon/prop-polygon.service";
import { PropCurveService } from "../map/prop-curve/prop-curve.service";
import { RoadBuilder } from 'app/map/builders/road.builder';
import { SplineBuilder } from './spline/spline.builder';
import { RoadFactory } from 'app/factories/road-factory.service';

@Injectable( {
	providedIn: 'root'
} )
export class SceneBuilderService {

	constructor (
		private splineBuilder: SplineBuilder,
		private roadBuilder: RoadBuilder,
		private surfaceBuilder: SurfaceBuilder,
		private roadObjectService: RoadObjectService,
		private roadSignalService: RoadSignalService,
		private propCurveService: PropCurveService,
		private propPolygonService: PropPolygonService,
		private roadFactory: RoadFactory,
	) {
	}

	buildScene ( map: TvMap ) {

		SceneService.removeFromMain( map.gameObject );

		map.getSplines().forEach( spline => this.buildSpline( map, spline ) );

		map.getRoads().forEach( road => this.buildRoad( map, road ) );

		map.getRoads().forEach( road => this.roadObjectService.buildRoadObjects( road ) );

		map.getRoads().forEach( road => this.roadSignalService.buildSignals( road ) );

		map.getSurfaces().forEach( surface => {

			map.surfaceGroup.add( surface, this.surfaceBuilder.buildSurface( surface ) );

		} );

		map.props.forEach( prop => {

			map.propsGroup.add( prop, prop.object );

		} );

		map.propCurves.forEach( propCurve => this.buildPropCurve( map, propCurve ) );

		map.propPolygons.forEach( propPolygon => this.buildPropPolygon( map, propPolygon ) );

		SceneService.addToMain( map.gameObject );

	}

	buildRoad ( map: TvMap, road: TvRoad ): void {

		function fixGeometry ( road: TvRoad ) {

			const segment = road.spline.findSegment( road );

			if ( ! segment ) console.error( 'Road segment not found ' + road.toString() );
			if ( ! segment ) return;

			road.clearGeometries();

			if ( segment.geometries.length == 0 ) return;

			segment.geometries.forEach( geometry => road.addGeometry( geometry ) );

		}

		const spline = this.findSpline( map, road );

		if ( spline && ( spline.type === SplineType.AUTO || spline.type == SplineType.AUTOV2 ) ) {

			road.spline = spline;

			fixGeometry( road );

			const gameObject = this.roadBuilder.buildRoad( road );

			map.gameObject.add( gameObject );

			this.roadFactory.setCounter( road.id );

		} else if ( road.spline?.type === SplineType.EXPLICIT ) {

			if ( road.sStart === undefined || road.sStart === null ) {
				road.sStart = 0;
			}

			if ( road.spline.getSplineSegments().length == 0 ) {
				road.spline.addRoadSegment( 0, road );
			}

			const gameObject = this.roadBuilder.buildRoad( road );

			map.gameObject.add( gameObject );

			this.roadFactory.setCounter( road.id );

		} else {

			map.removeRoad( road );
			TvConsole.error( 'Road spline not found for road id ' + road.id );
			return;
		}

	}

	findSpline ( scene: TvMap, road: TvRoad ): AbstractSpline {

		return scene.getSplines().find( spline => spline.findSegment( road ) );

	}

	buildPropCurve ( map: TvMap, propCurve: PropCurve ): void {

		this.propCurveService.update( propCurve );

	}

	buildPropPolygon ( map: TvMap, propPolygon: PropPolygon ): void {

		this.propPolygonService.update( propPolygon );

	}

	private buildSpline ( map: TvMap, spline: AbstractSpline ) {

		spline.updateRoadSegments();

	}
}
