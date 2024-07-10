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
import { RoadSignalIdService } from "../map/road-signal/road-signal-id.service";
import { SplineService } from "./spline/spline.service";
import { RoadService } from "./road/road.service";

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
		private signalIdService: RoadSignalIdService,
		private splineService: SplineService,
		private roadService: RoadService,
	) {
	}

	buildScene ( map: TvMap ) {

		SceneService.removeFromMain( map.gameObject );

		map.getSplines().forEach( spline => this.splineBuilder.buildSpline( spline ) );

		map.getRoads().forEach( road => this.buildRoad( map, road ) );

		map.getSplines().forEach( spline => this.splineBuilder.buildBoundingBox( spline ) );

		// NOTE: note needed as road builder already is building these
		// map.getRoads().forEach( road => this.roadObjectService.buildRoadObjects( road ) );
		// map.getRoads().forEach( road => this.roadSignalService.buildSignals( road ) );

		map.getSurfaces().forEach( surface => {

			surface.mesh = this.surfaceBuilder.build( surface );

			if ( !surface.mesh ) {
				TvConsole.error( 'Error building surface mesh for surface id ' + surface.uuid );
				return;
			}

			map.surfaceGroup.add( surface, surface.mesh );

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

			this.roadService.updateRoadGeometries( road );

			road.gameObject = this.roadBuilder.buildRoad( road );

			map.gameObject.add( road.gameObject );

		} else if ( road.spline?.type === SplineType.EXPLICIT ) {

			if ( road.sStart === undefined || road.sStart === null ) {
				road.sStart = 0;
			}

			if ( road.spline.segmentMap.length == 0 ) {
				road.spline.segmentMap.set( 0, road );
			}

			this.splineBuilder.buildSpline( road.spline );

			road.gameObject = this.roadBuilder.buildRoad( road );

			map.gameObject.add( road.gameObject );

		} else {

			map.removeRoad( road );
			TvConsole.error( 'Road spline not found for road id ' + road.id );
			return;
		}

	}

	findSpline ( scene: TvMap, road: TvRoad ): AbstractSpline {

		return scene.getSplines().find( spline => this.splineService.hasSegment( spline, road ) );

	}

	buildPropCurve ( map: TvMap, propCurve: PropCurve ): void {

		this.propCurveService.update( propCurve );

	}

	buildPropPolygon ( map: TvMap, propPolygon: PropPolygon ): void {

		this.propPolygonService.update( propPolygon );

	}

}
