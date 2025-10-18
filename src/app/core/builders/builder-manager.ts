/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { MapEvents } from "app/events/map-events";
import { TvMap } from "app/map/models/tv-map.model";
import { MapService } from "app/services/map/map.service";
import { MeshBuilder } from "./mesh.builder";
import { BuilderFactory } from "app/modules/builder/builder.factory";
import { TvRoad } from "app/map/models/tv-road.model";
import { GameObject } from "app/objects/game-object";
import { AbstractSpline } from "../shapes/abstract-spline";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { Mesh } from "three";
import { Log } from "../utils/log";
import { ParkingCurve } from "app/map/parking/parking-curve";

@Injectable( {
	providedIn: 'root'
} )
export class BuilderManager {

	constructor (
		private mapService: MapService,
		private factory: BuilderFactory,
	) {
		this.init();
	}

	init (): void {

		MapEvents.splineRemoved.subscribe( object => this.removeSpline( object.spline, this.mapService.map ) );
		MapEvents.roadRemoved.subscribe( object => this.removeRoadMesh( object.road, this.mapService.map ) );
		MapEvents.junctionRemoved.subscribe( object => this.removeJunctionMesh( object.junction, this.mapService.map ) );

		MapEvents.makeMesh.subscribe( object => this.makeMesh( object ) );
		MapEvents.removeMesh.subscribe( object => this.removeMesh( object ) );

	}

	makeMesh ( object: any ): void {

		if ( object instanceof TvRoad ) {
			this.buildRoad( object, this.mapService.map );
		} else if ( object instanceof TvJunction ) {
			this.buildJunction( object, this.mapService.map );
		} else if ( object instanceof AbstractSpline ) {
			this.buildSpline( object, this.mapService.map );
		} else if ( object instanceof ParkingCurve ) {
			this.buildParkingCurve( object, this.mapService.map );
		} else {
			Log.error( 'Unknown object type', object );
		}

	}

	removeMesh ( object: any ): void {

		if ( object instanceof TvRoad ) {
			this.removeRoadMesh( object, this.mapService.map );
		} else if ( object instanceof TvJunction ) {
			this.removeJunctionMesh( object, this.mapService.map );
		} else if ( object instanceof AbstractSpline ) {
			this.removeSpline( object, this.mapService.map );
		} else {
			Log.error( 'Unknown object type', object );
		}

	}


	removeJunctionMesh ( junction: TvJunction, map: TvMap ): void {

		// Log.debug( 'Remove junction mesh', junction.toString() );

		if ( junction.mesh ) map.gameObject.remove( junction.mesh );

		junction.getConnections().forEach( connection => {

			this.removeRoadMesh( connection.connectingRoad, map );

		} );

	}

	buildJunction ( junction: TvJunction, map: TvMap ): void {

		// Log.debug( 'Build junction mesh', junction.toString() );

		if ( junction.mesh ) map.gameObject.remove( junction.mesh );

		const mesh = this.getBuilder( junction ).build( junction ) as Mesh;

		junction.mesh = mesh;

		map.gameObject.add( junction.mesh );

	}

	buildRoad ( road: TvRoad, map: TvMap ): void {

		this.removeRoadMesh( road, map );

		road.gameObject = this.getBuilder( road ).build( road ) as GameObject;

		map.gameObject.add( road.gameObject );

		// Log.debug( 'Add road mesh', road.toString() );

	}

	removeRoadMesh ( road: TvRoad, map: TvMap ): void {

		// Log.debug( 'Remove road mesh', road.toString() );

		road.getLaneProfile().getLaneSections().forEach( laneSection => {
			laneSection.gameObject?.remove();
			laneSection.getLanes().forEach( lane => lane.gameObject?.remove() );
		} )

		if ( road.gameObject ) {
			map.gameObject.remove( road.gameObject );
		}

		road.getRoadObjects().forEach( object => {
			// this.roadObjectService.removeObject3d( road, object );
		} );

	}

	getBuilder<T> ( object: object ): MeshBuilder<T> {

		return this.factory.getBuilder( object );

	}

	buildSpline ( spline: AbstractSpline, map: TvMap ): void {

		spline.getRoadSegments().forEach( road => this.buildRoad( road, map ) );

	}

	removeSpline ( spline: AbstractSpline, map: TvMap ): void {

		// Log.debug( 'Remove spline mesh', spline.toString() );

		spline.getRoadSegments().forEach( road => this.removeRoadMesh( road, map ) );

	}

	buildParkingCurve ( parkingCurve: ParkingCurve, map: TvMap ): void {

		const mesh = this.factory.getBuilder( parkingCurve ).build( parkingCurve );

		map.parkingCurveGroup.add( parkingCurve, mesh );

	}

	removeParkingCurve ( parkingCurve: ParkingCurve, map: TvMap ): void {

		map.parkingCurveGroup.remove( parkingCurve );

	}

}
