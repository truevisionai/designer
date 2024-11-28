/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvMap } from 'app/map/models/tv-map.model';
import { TvRoad } from 'app/map/models/tv-road.model';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { SplineType } from 'app/core/shapes/spline-type';
import { TvConsole } from 'app/core/utils/console';
import { PropCurve } from 'app/map/prop-curve/prop-curve.model';
import { PropPolygon } from 'app/map/prop-polygon/prop-polygon.model';
import { SceneService } from '../../../services/scene.service';
import { SplineGeometryGenerator } from '../../../services/spline/spline-geometry-generator';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { JunctionManager } from 'app/managers/junction-manager';
import { ConnectionFactory } from 'app/factories/connection.factory';
import { LinkUtils } from 'app/utils/link.utils';
import { Log } from 'app/core/utils/log';
import { Surface } from 'app/map/surface/surface.model';
import { TvJunctionBoundaryService } from 'app/map/junction-boundary/tv-junction-boundary.service';
import { BuilderManager } from 'app/core/builders/builder-manager';
import { MapEvents } from 'app/events/map-events';
import { PropCurveMeshManager, PropPolygonMeshManager, SurfaceMeshManager } from '../managers/mesh-managers';

@Injectable()
export class SceneBuilder {

	constructor (
		private splineBuilder: SplineGeometryGenerator,
		private junctionManager: JunctionManager,
		private connectionFactory: ConnectionFactory,
		private junctionBoundaryService: TvJunctionBoundaryService,
		private builderManager: BuilderManager,
		private surfaceMeshManager: SurfaceMeshManager,
		private propCurveMeshManager: PropCurveMeshManager,
		private propPolygonMeshManager: PropPolygonMeshManager,
	) {
		MapEvents.mapImported.subscribe( map => this.buildScene( map ) );
	}

	buildScene ( map: TvMap ) {

		SceneService.removeFromMain( map.gameObject );

		this.buildSplineAndRoads( map );

		map.getJunctions().forEach( junction => this.buildJunction( map, junction ) );

		map.getSurfaces().forEach( surface => this.surfaceMeshManager.buildSurface( surface, map ) );

		map.getProps().forEach( prop => {

			map.propsGroup.add( prop, prop.object );

		} );

		map.propCurves.forEach( curve => this.propCurveMeshManager.buildPropCurve( curve, map ) );

		map.propPolygons.forEach( polygon => this.propPolygonMeshManager.buildPropPolygon( polygon, map ) );

		SceneService.addToMain( map.gameObject );

	}

	buildSplineAndRoads ( map: TvMap ): void {

		// NOTE: sequence spline & road building is important
		map.getSplines().forEach( spline => this.splineBuilder.buildGeometry( spline ) );
		map.getRoads().forEach( road => this.buildOrRemoveRoad( map, road ) );
		map.getSplines().forEach( spline => this.splineBuilder.updateBounds( spline ) );

	}

	buildSurface ( map: TvMap, surface: Surface ): void {

		this.surfaceMeshManager.buildSurface( surface, map );

	}

	buildJunction ( map: TvMap, junction: TvJunction ): void {

		if ( junction.getConnectionCount() == 0 ) {

			TvConsole.warn( `Removing junction with no connections ${ junction.id }` );

			this.junctionManager.removeJunction( junction );

			return;
		}

		this.junctionBoundaryService.update( junction );

		this.buildCorners( junction );

		junction.updatePositionAndBounds();

		this.builderManager.buildJunction( junction, map );

	}

	buildCorners ( junction: TvJunction ): void {

		if ( junction.corners.length > 0 ) return;

		try {

			this.connectionFactory.addCornerConnections( junction );

		} catch ( error ) {

			Log.error( error );

		}

	}

	buildOrRemoveRoad ( map: TvMap, road: TvRoad ): void {

		LinkUtils.updateLaneUuidLinks( road );

		try {

			const spline = this.findRoadSpline( map, road );

			this.validateRoadBuild( map, road, spline );

			this.buildRoad( map, road, spline );

		} catch ( error ) {

			map.removeRoad( road );

			Log.error( error );

		}

	}

	buildRoad ( map: TvMap, road: TvRoad, spline: AbstractSpline ): void {

		if ( spline.type === SplineType.AUTO || spline.type == SplineType.AUTOV2 ) {

			this.buildRoadMesh( map, road, spline );

		} else if ( road.spline?.type === SplineType.EXPLICIT ) {

			road.sStart = 0;

			road.clearGeometryAndUpdateCoords();

			road.spline.getGeometries().forEach( geometry => road.addGeometryAndUpdateCoords( geometry ) );

			this.buildRoadMesh( map, road, road.spline );

		} else {

			throw new Error( `Road spline not found for road id ${ road.id }` );

		}

	}

	private validateRoadBuild ( map: TvMap, road: TvRoad, spline: AbstractSpline ): void {

		if ( spline.getControlPointCount() < 2 ) {
			throw new Error( `Invalid control points for road id ${ road.id }` );
		}

		if ( road.getPlanView().getGeometryCount() == 0 ) {
			this.splineBuilder.buildGeometry( spline );
		}

		if ( road.getPlanView().getGeometryCount() == 0 ) {
			throw new Error( `No geometry found for road id ${ road.id }` );
		}

		if ( spline.getSegmentCount() == 0 ) {
			Log.warn( `No segments found for road id ${ road.id }` );
			spline.addSegment( 0, road );
		}
	}

	private findRoadSpline ( map: TvMap, road: TvRoad ): AbstractSpline {

		const spline = map.findSplineBySegment( road ) || road.spline;

		if ( !spline ) {
			throw new Error( `Road spline not found for road id ${ road.id }` );
		}

		return spline;

	}

	private buildRoadMesh ( map: TvMap, road: TvRoad, spline: AbstractSpline ): void {

		road.spline = spline;

		this.builderManager.buildRoad( road, map );

	}

}
