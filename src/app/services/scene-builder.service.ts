/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvMap } from 'app/map/models/tv-map.model';
import { RoadService } from './road/road.service';
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

@Injectable( {
	providedIn: 'root'
} )
export class SceneBuilderService {

	constructor (
		private roadService: RoadService,
		private surfaceBuilder: SurfaceBuilder,
		private roadObjectService: RoadObjectService,
		private roadSignalService: RoadSignalService,
		private propCurveService: PropCurveService,
		private propPolygonService: PropPolygonService,
	) {
	}

	buildScene ( map: TvMap ) {

		SceneService.removeFromMain( map.gameObject );

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

		const spline = this.findSpline( map, road );

		if ( spline && ( spline.type === SplineType.AUTO || spline.type == SplineType.AUTOV2 ) ) {

			road.spline = spline;

			this.roadService.buildRoad( road ).forEach( gameObject => map.gameObject.add( gameObject ) );
			this.roadService.setRoadIdCounter( road.id );

		} else if ( road.spline?.type === SplineType.EXPLICIT ) {

			if ( road.sStart === undefined || road.sStart === null ) {
				road.sStart = 0;
			}

			if ( road.spline.getSplineSegments().length == 0 ) {
				road.spline.addRoadSegment( 0, road );
			}

			this.roadService.buildRoad( road ).forEach( gameObject => map.gameObject.add( gameObject ) );
			this.roadService.setRoadIdCounter( road.id );

		} else {

			map.removeRoad( road );
			TvConsole.error( 'Road spline not found for road id ' + road.id );
			return;
		}

	}

	findSpline ( scene: TvMap, road: TvRoad ): AbstractSpline {

		return scene.getSplines().find( spline => spline.getSplineSegments().find( segment => segment.id === road.id ) );

	}

	buildPropCurve ( map: TvMap, propCurve: PropCurve ): void {

		this.propCurveService.update( propCurve );

	}

	buildPropPolygon ( map: TvMap, propPolygon: PropPolygon ): void {

		this.propPolygonService.update( propPolygon );

	}

}
