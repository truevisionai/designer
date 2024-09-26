import { Inject, Injectable } from "@angular/core";
import { ConstructorFunction } from "../models/class-map";
import { BUILD_PROVIDERS, BuilderProvider, MeshBuilder } from "./mesh.builder";
import { MapEvents } from "app/events/map-events";
import { PropCurve } from "app/map/prop-curve/prop-curve.model";
import { TvMap } from "app/map/models/tv-map.model";
import { MapService } from "app/services/map/map.service";

@Injectable( {
	providedIn: 'root'
} )
export class BuilderManager {

	private builderMap = new Map<ConstructorFunction, MeshBuilder<any>>();

	constructor (
		private mapService: MapService,
		@Inject( BUILD_PROVIDERS ) private providers: BuilderProvider[]
	) {
		this.init();
	}

	init (): void {

		this.providers.forEach( provider => {

			this.builderMap.set( provider.key, provider.builder );

		} );

		MapEvents.propCurveUpdated.subscribe( curve => this.buildPropCurve( curve, this.mapService.map ) );
		MapEvents.propCurveRemoved.subscribe( curve => this.removePropCurve( curve, this.mapService.map ) );

	}

	getBuilder<T> ( object: object ): MeshBuilder<T> {

		return this.builderMap.get( object.constructor as ConstructorFunction ) as MeshBuilder<T>;

	}

	buildPropCurve ( curve: PropCurve, map: TvMap ): void {

		if ( curve.getSpline().getControlPointCount() < 2 ) return;

		const mesh = this.getBuilder( curve ).build( curve );

		map.propCurvesGroup.add( curve, mesh );

		this.getBuilder( curve ).build( curve );

	}

	removePropCurve ( curve: PropCurve, map: TvMap ): void {

		map.propCurvesGroup.remove( curve );

	}

}
