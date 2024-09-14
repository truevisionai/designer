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
import { Log } from 'app/core/utils/log';
import { Maths } from 'app/utils/maths';
import { Surface } from 'app/map/surface/surface.model';
import { JunctionBoundsService } from './junction/junction-geometry.service';
import { TvJunctionBoundaryService } from 'app/map/junction-boundary/tv-junction-boundary.service';

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
		private connectionFactory: ConnectionFactory,
		private junctionBoundaryService: TvJunctionBoundaryService,
		private junctionBoundsService: JunctionBoundsService
	) {
	}

	buildScene ( map: TvMap ) {

		SceneService.removeFromMain( map.gameObject );

		this.buildSplineAndRoads( map );

		map.getJunctions().forEach( junction => this.buildJunction( map, junction ) );

		map.getSurfaces().forEach( surface => this.buildSurface( map, surface ) );

		map.getProps().forEach( prop => {

			map.propsGroup.add( prop, prop.object );

		} );

		map.propCurves.forEach( propCurve => this.buildPropCurve( map, propCurve ) );

		map.propPolygons.forEach( propPolygon => this.buildPropPolygon( map, propPolygon ) );

		SceneService.addToMain( map.gameObject );

	}

	buildSplineAndRoads ( map: TvMap ): void {

		// NOTE: sequence spline & road building is important
		map.getSplines().forEach( spline => this.splineBuilder.buildGeometry( spline ) );
		map.getRoads().forEach( road => this.buildRoad( map, road ) );
		map.getSplines().forEach( spline => this.splineBuilder.updateBounds( spline ) );

	}

	buildSurface ( map: TvMap, surface: Surface ): void {

		surface.mesh = this.surfaceBuilder.build( surface );

		if ( !surface.mesh ) {
			Log.error( `Error building surface mesh for surface id ${ surface.uuid }` );
			return;
		}

		map.surfaceGroup.add( surface, surface.mesh );

	}

	buildJunction ( map: TvMap, junction: TvJunction ): void {

		if ( junction.getConnectionCount() == 0 ) {

			TvConsole.warn( `Removing junction with no connections ${ junction.id }` );

			this.junctionManager.removeJunction( junction );

			return;
		}

		this.junctionBoundaryService.update( junction );

		this.buildCorners( junction );

		this.junctionBoundsService.updateBounds( junction );

		junction.mesh = this.junctionBuilder.buildJunction( junction );

		map.gameObject.add( junction.mesh );

	}

	buildCorners ( junction: TvJunction ): void {

		if ( junction.corners.length > 0 ) return;

		try {

			this.connectionFactory.addCornerConnections( junction );

		} catch ( error ) {

			Log.error( error );

		}

	}

	buildRoad ( map: TvMap, road: TvRoad ): void {

		LinkUtils.updateLaneUuidLinks( road );

		const spline = map.findSplineBySegment( road ) || road.spline;

		if ( !spline ) {
			map.removeRoad( road );
			Log.error( `Road spline not found for road id ${ road.id }` );
			return;
		}

		if ( spline.type === SplineType.AUTO || spline.type == SplineType.AUTOV2 ) {

			this.buildRoadMesh( map, road, spline );

		} else if ( road.spline?.type === SplineType.EXPLICIT ) {

			this.buildRoadWithExplicitSpline( map, road );

		} else {

			map.removeRoad( road );
			Log.error( `Road spline not found for road id ${ road.id }` );
			return;

		}

	}
	buildRoadWithExplicitSpline ( map: TvMap, road: TvRoad ): void {

		road.sStart = 0;

		road.clearGeometryAndUpdateCoords();

		road.spline.getGeometries().forEach( geometry => road.addGeometryAndUpdateCoords( geometry ) );

		this.buildRoadMesh( map, road, road.spline );

	}

	buildRoadMesh ( map: TvMap, road: TvRoad, spline: AbstractSpline ): void {

		road.spline = spline;

		if ( spline.segmentMap.length == 0 ) {
			Log.warn( `No segments found for road id ${ road.id }` );
			spline.segmentMap.set( 0, road );
		}

		try {

			road.gameObject = this.roadBuilder.buildRoad( road );

			map.gameObject.add( road.gameObject );

		} catch ( error ) {

			Log.error( error );

			map.removeRoad( road );

			return;

		}

	}

	buildPropCurve ( map: TvMap, propCurve: PropCurve ): void {

		this.propCurveService.update( propCurve );

	}

	buildPropPolygon ( map: TvMap, propPolygon: PropPolygon ): void {

		this.propPolygonService.update( propPolygon );

	}

}
