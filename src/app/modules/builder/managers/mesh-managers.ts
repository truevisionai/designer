import { Injectable } from "@angular/core";
import { BuilderFactory } from "../builder.factory";
import { MapEvents } from "app/events/map-events";
import { TvMap } from "app/map/models/tv-map.model";
import { Surface } from "app/map/surface/surface.model";
import { MapService } from "app/services/map/map.service";
import { PropCurve } from "app/map/prop-curve/prop-curve.model";
import { PropPolygon } from "app/map/prop-polygon/prop-polygon.model";
import { RoadObjectBuilder } from "../builders/road-object.builder";
import { Log } from "app/core/utils/log";
import { TvRoad } from "app/map/models/tv-road.model";
import { TvRoadObject } from "app/map/models/objects/tv-road-object";
import { RoadObjectValidator } from "app/map/road-object/road-object-validator";
import { ValidationException } from "app/exceptions/exceptions";
import { RoadSignalBuilder } from "../builders/road-signal.builder";
import { TvRoadSignal } from "app/map/road-signal/tv-road-signal.model";

@Injectable()
export class SurfaceMeshManager {

	constructor ( private factory: BuilderFactory, private mapService: MapService ) {

		MapEvents.surfaceAdded.subscribe( object => this.buildSurface( object, this.mapService.map ) );
		MapEvents.surfaceRemoved.subscribe( object => this.removeSurface( object, this.mapService.map ) );
		MapEvents.surfaceUpdated.subscribe( object => this.buildSurface( object, this.mapService.map ) );

	}

	buildSurface ( surface: Surface, map: TvMap ): void {

		surface.mesh = this.factory.getBuilder( surface ).build( surface );

		if ( !surface.mesh ) {
			Log.error( `Error building surface mesh for surface id ${ surface.uuid }` );
			return;
		}

		map.surfaceGroup.add( surface, surface.mesh );

	}

	removeSurface ( surface: Surface, map: TvMap ): void {

		map.surfaceGroup.remove( surface );

	}

}


@Injectable()
export class PropCurveMeshManager {

	constructor ( private factory: BuilderFactory, private mapService: MapService ) {

		MapEvents.propCurveUpdated.subscribe( object => this.buildPropCurve( object, this.mapService.map ) );
		MapEvents.propCurveRemoved.subscribe( object => this.removePropCurve( object, this.mapService.map ) );

	}

	buildPropCurve ( curve: PropCurve, map: TvMap ): void {

		if ( curve.getSpline().getControlPointCount() < 2 ) return;

		const builder = this.factory.getBuilder( curve );

		const mesh = builder.build( curve );

		map.propCurvesGroup.add( curve, mesh );

	}

	removePropCurve ( curve: PropCurve, map: TvMap ): void {

		map.propCurvesGroup.remove( curve );

	}

}


@Injectable()
export class PropPolygonMeshManager {

	constructor ( private factory: BuilderFactory, private mapService: MapService ) {

		MapEvents.propPolygonUpdated.subscribe( object => this.buildPropPolygon( object, this.mapService.map ) );
		MapEvents.propPolygonRemoved.subscribe( object => this.removePropPolygon( object, this.mapService.map ) );

	}

	buildPropPolygon ( polygon: PropPolygon, map: TvMap ): void {

		if ( polygon.spline.getControlPointCount() < 3 ) return;

		const mesh = this.factory.getBuilder( polygon ).build( polygon );

		map.propPolygonsGroup.add( polygon, mesh );

	}

	removePropPolygon ( polygon: PropPolygon, map: TvMap ): void {

		map.propPolygonsGroup.remove( polygon );

	}


}


@Injectable()
export class RoadObjectMeshManager {

	constructor (
		private builder: RoadObjectBuilder,
	) {

		MapEvents.roadObjectAdded.subscribe( event => this.build( event.road, event.roadObject ) );
		MapEvents.roadObjectRemoved.subscribe( event => this.remove( event.road, event.roadObject ) );
		MapEvents.roadObjectUpdated.subscribe( event => this.update( event.road, event.roadObject ) );

	}

	build ( road: TvRoad, object: TvRoadObject ): void {

		try {

			RoadObjectValidator.validateRoadObject( object );

			object.mesh = this.builder.build( object );

			road.objectGroup.add( object.mesh );

		} catch ( error ) {

			if ( error instanceof ValidationException ) {

				Log.error( 'Validation error updating road object:', error );

			} else {

				Log.error( 'Error updating road object:', error );

			}

			road.removeRoadObject( object );

		}

	}

	update ( road: TvRoad, object: TvRoadObject ): void {

		this.remove( road, object );

		this.build( road, object );

	}

	remove ( road: TvRoad, object: TvRoadObject ): void {

		road.objectGroup.remove( object.mesh );

	}

}


@Injectable()
export class RoadSignalMeshManager {

	constructor (
		private builder: RoadSignalBuilder,
	) {

		MapEvents.roadSignalAdded.subscribe( event => this.build( event.road, event.roadSignal ) );
		MapEvents.roadSignalRemoved.subscribe( event => this.remove( event.road, event.roadSignal ) );
		MapEvents.roadSignalUpdated.subscribe( event => this.update( event.road, event.roadSignal ) );

	}

	build ( road: TvRoad, signal: TvRoadSignal ): void {

		try {

			signal.mesh = this.builder.build( signal, road );

			road.signalGroup.add( signal.mesh );

		} catch ( error ) {

			if ( error instanceof ValidationException ) {

				Log.error( 'Validation error updating road object:', error );

			} else {

				Log.error( 'Error updating road object:', error );

			}

			road.removeRoadSignal( signal );

		}

	}

	update ( road: TvRoad, signal: TvRoadSignal ): void {

		this.remove( road, signal );

		this.build( road, signal );

	}

	remove ( road: TvRoad, signal: TvRoadSignal ): void {

		road.signalGroup.remove( signal.mesh );

	}

}
