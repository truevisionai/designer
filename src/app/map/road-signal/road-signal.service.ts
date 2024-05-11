/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoadSignal } from 'app/map/road-signal/tv-road-signal.model';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadSignalBuilder } from './road-signal.builder';
import { Object3DMap } from 'app/core/models/object3d-map';
import { Group, Object3D } from 'three';
import { SceneService } from "../../services/scene.service";

@Injectable( {
	providedIn: 'root'
} )
export class RoadSignalService {

	private objectMap: Object3DMap<TvRoadSignal, Object3D>;

	constructor (
		private signalBuilder: RoadSignalBuilder,
	) {
		this.objectMap = new Object3DMap<TvRoadSignal, Object3D>( SceneService.getMainLayer() );
	}

	buildSignals ( road: TvRoad ) {

		const group = new Group();

		group.name = 'RoadSignals';

		for ( const signal of road.signals.values() ) {

			const mesh = this.buildSignal( road, signal );

			if ( !mesh ) continue;

			group.add( mesh );

		}

		return group;
	}

	buildSignal ( road: TvRoad, signal: TvRoadSignal ) {

		const mesh = this.signalBuilder.buildSignal( road, signal );

		this.objectMap.add( signal, mesh );

		return mesh;

	}

	addSignal ( road: TvRoad, signal: TvRoadSignal, object: Object3D ) {

		road.signals.set( signal.id, signal );

		this.objectMap.add( signal, object );

	}

	removeSignal ( road: TvRoad, signal: TvRoadSignal ) {

		road.signals.delete( signal.id );

		this.objectMap.remove( signal );

	}

	updateSignal ( road: TvRoad, signal: TvRoadSignal ) {

		this.objectMap.remove( signal );

		const mesh = this.signalBuilder.buildSignal( road, signal );

		this.objectMap.add( signal, mesh );

	}

	updateSignalPosition ( road: TvRoad, signal: TvRoadSignal ) {

		const position = this.getSignalPosition( road, signal );

		const object = this.objectMap.get( signal );

		object.position.set( position.x, position.y, position.z );

	}

	getSignalPosition ( road: TvRoad, signal: TvRoadSignal ) {

		return road.getPosThetaAt( signal.s, signal.t );

	}

}
