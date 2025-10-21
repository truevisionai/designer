/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BUILD_PROVIDERS } from 'app/core/builders/mesh.builder';
import { PropCurve } from 'app/map/prop-curve/prop-curve.model';
import { PropPolygon } from 'app/map/prop-polygon/prop-polygon.model';
import { SceneBuilder } from './builders/scene.builder';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { PropCurveMeshManager, PropPolygonMeshManager, RoadObjectMeshManager, RoadSignalMeshManager, SurfaceMeshManager } from './managers/mesh-managers';
import { Surface } from 'app/map/surface/surface.model';
import { PropCurveBuilder } from './builders/prop-curve.builder';
import { PropPolygonBuilder } from './builders/prop-polygon.builder';
import { SurfaceBuilder } from './builders/surface.builder';
import { JunctionMeshBuilder } from './builders/junction-mesh.builder';
import { RoadMeshBuilder } from './builders/road-mesh.builder';
import { TvRoadObject } from 'app/map/models/objects/tv-road-object';
import { RoadObjectBuilder } from './builders/road-object.builder';
import { LaneRoadMarkBuilder } from './builders/lane-road-mark.builder';
import { TvRoadSignal } from 'app/map/road-signal/tv-road-signal.model';
import { RoadSignalBuilder } from './builders/road-signal.builder';
import { JunctionBoundaryBuilder } from './builders/junction-boundary.builder';
import { AutoJunction } from "../../map/models/junctions/auto-junction";
import { DefaultJunction } from "../../map/models/junctions/default-junction";
import { ParkingCurve } from 'app/map/parking/parking-curve';
import { ParkingCurveBuilder, ParkingRegionBuilder } from './builders/parking-curve.builder';
import { ParkingRegion } from 'app/map/parking/parking-region';

const Managers = [
	SurfaceMeshManager,
	PropCurveMeshManager,
	PropPolygonMeshManager,
	RoadObjectMeshManager,
	RoadSignalMeshManager,
]

export function initializeSceneBuilder ( sceneBuilder: SceneBuilder ): () => void {
	return () => {
		// Any initialization logic can be added here
		// console.log( 'Initializing SceneBuilder' );
		// The constructor is automatically called by DI,
		// but you can invoke any setup method if needed
	};
}

export function initializeManagers ( injector: Injector ): () => void {
	return () => {
		Managers.forEach( manager => injector.get( manager ) );
	};
}

const Builders = [
	PropCurveBuilder,
	PropPolygonBuilder,
	SurfaceBuilder,
	RoadMeshBuilder,
	JunctionMeshBuilder,
	JunctionBoundaryBuilder,
	SceneBuilder,
	RoadObjectBuilder,
	LaneRoadMarkBuilder,
	RoadSignalBuilder,
	ParkingCurveBuilder,
	ParkingRegionBuilder,
]

const Providers = [
	{
		provide: APP_INITIALIZER,
		useFactory: initializeSceneBuilder,
		deps: [ SceneBuilder ],
		multi: true,
	},
	{
		provide: APP_INITIALIZER,
		useFactory: initializeManagers,
		deps: [ Injector ],
		multi: true,
	},
	{
		provide: BUILD_PROVIDERS,
		useValue: {
			key: PropCurve,
			builderClass: PropCurveBuilder,
		},
		multi: true,
	},
	{
		provide: BUILD_PROVIDERS,
		useValue: {
			key: PropPolygon,
			builderClass: PropPolygonBuilder,
		},
		multi: true,
	},
	{
		provide: BUILD_PROVIDERS,
		useValue: {
			key: TvRoad,
			builderClass: RoadMeshBuilder,
		},
		multi: true,
	},
	{
		provide: BUILD_PROVIDERS,
		useValue: {
			key: TvJunction,
			builderClass: JunctionMeshBuilder,
		},
		multi: true,
	},
	{
		provide: BUILD_PROVIDERS,
		useValue: {
			key: AutoJunction,
			builderClass: JunctionMeshBuilder,
		},
		multi: true,
	},
	{
		provide: BUILD_PROVIDERS,
		useValue: {
			key: DefaultJunction,
			builderClass: JunctionMeshBuilder,
		},
		multi: true,
	},
	{
		provide: BUILD_PROVIDERS,
		useValue: {
			key: Surface,
			builderClass: SurfaceBuilder,
		},
		multi: true,
	},
	{
		provide: BUILD_PROVIDERS,
		useValue: {
			key: TvRoadObject,
			builderClass: RoadObjectBuilder,
		},
		multi: true,
	},
	{
		provide: BUILD_PROVIDERS,
		useValue: {
			key: TvRoadSignal,
			builderClass: RoadSignalBuilder,
		},
		multi: true,
	},
	{
		provide: BUILD_PROVIDERS,
		useValue: {
			key: ParkingCurve,
			builderClass: ParkingCurveBuilder,
		},
		multi: true,
	},
	{
		provide: BUILD_PROVIDERS,
		useValue: {
			key: ParkingRegion,
			builderClass: ParkingRegionBuilder,
		},
		multi: true,
	},
]

@NgModule( {
	imports: [
		CommonModule
	],
	declarations: [],
	providers: [
		...Builders,
		...Managers,
		...Providers,
	]
} )
export class BuilderModule { }
