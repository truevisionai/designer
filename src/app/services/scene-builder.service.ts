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
import { JunctionBuilder } from './junction/junction.builder';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { JunctionManager } from 'app/managers/junction-manager';
import { TvJunctionBoundaryFactory } from "../map/junction-boundary/tv-junction-boundary.factory";
import { ConnectionFactory } from 'app/factories/connection.factory';
import { SplineUtils } from "../utils/spline.utils";
import { LinkUtils } from 'app/utils/link.utils';

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
		private junctionBuilder: JunctionBuilder,
		private junctionManager: JunctionManager,
		private connectionFactory: ConnectionFactory
	) {
	}

	buildScene ( map: TvMap ) {

		SceneService.removeFromMain( map.gameObject );

		map.getSplines().forEach( spline => this.splineBuilder.buildGeometry( spline ) );

		map.getRoads().forEach( road => this.buildRoad( map, road ) );

		map.getSplines().forEach( spline => this.splineBuilder.buildBoundingBox( spline ) );

		map.getJunctions().forEach( junction => this.buildJunction( map, junction ) );

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

	buildJunction ( map: TvMap, junction: TvJunction ): void {

		if ( junction.connections.size == 0 ) {

			TvConsole.warn( 'Removing junction with no connections ' + junction.id );

			this.junctionManager.removeJunction( junction );

			return;
		}

		if ( !junction.boundary || junction.boundary.segments.length == 0 ) {

			TvConsole.warn( 'Re-building boundary for junction:' + junction.id );

			junction.boundary = TvJunctionBoundaryFactory.createFromJunction( junction );

		}

		if ( junction.corners.length == 0 ) {

			this.connectionFactory.addCornerConnections( junction );

		}

		junction.mesh = this.junctionBuilder.build( junction );

		map.gameObject?.add( junction.mesh );

	}

	buildRoad ( map: TvMap, road: TvRoad ): void {

		LinkUtils.updateLaneUuidLinks( road );

		const spline = this.findSpline( map, road ) || road.spline;

		if ( !spline ) {
			map.removeRoad( road );
			TvConsole.error( 'Road spline not found for road id ' + road.id );
			return;
		}

		if ( spline.type === SplineType.AUTO || spline.type == SplineType.AUTOV2 ) {

			road.spline = spline;

			road.gameObject = this.roadBuilder.buildRoad( road );

			map.gameObject.add( road.gameObject );

		} else if ( road.spline?.type === SplineType.EXPLICIT ) {

			road.sStart = 0;

			if ( road.spline.segmentMap.length == 0 ) {
				road.spline.segmentMap.set( 0, road );
			}

			road.gameObject = this.roadBuilder.buildRoad( road );

			map.gameObject.add( road.gameObject );

		} else {

			map.removeRoad( road );
			TvConsole.error( 'Road spline not found for road id ' + road.id );
			return;

		}

	}

	findSpline ( scene: TvMap, road: TvRoad ): AbstractSpline {

		return scene.getSplines().find( spline => SplineUtils.hasSegment( spline, road ) );

	}

	buildPropCurve ( map: TvMap, propCurve: PropCurve ): void {

		this.propCurveService.update( propCurve );

	}

	buildPropPolygon ( map: TvMap, propPolygon: PropPolygon ): void {

		this.propPolygonService.update( propPolygon );

	}

}
