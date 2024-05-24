/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { Asset } from 'app/core/asset/asset.model';
import { Object3D, Vector3 } from 'three';
import { TvRoadSignal } from 'app/map/road-signal/tv-road-signal.model';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadSignalService } from 'app/map/road-signal/road-signal.service';
import { RoadSignalFactory } from 'app/map/road-signal/road-signal.factory';
import { RoadService } from 'app/services/road/road.service';
import { AssetManager } from 'app/core/asset/asset.manager';
import { Object3DMap } from '../../core/models/object3d-map';
import { ControlPointFactory } from 'app/factories/control-point.factory';

@Injectable( {
	providedIn: 'root'
} )
export class RoadSignalToolService {

	private points = new Object3DMap<TvRoadSignal, Object3D>();

	constructor (
		public base: BaseToolService,
		public roadSignalService: RoadSignalService,
		public signalFactory: RoadSignalFactory,
		public roadService: RoadService,
		public assetManager: AssetManager,
		public controlPointFactory: ControlPointFactory,
	) {
	}

	getSelectedAsset (): Asset {

		return this.assetManager.getTextureAsset();

	}

	createRoadSignal ( asset: Asset, position: Vector3, type: string, subtype: string ): TvRoadSignal {

		const lane = this.roadService.findLaneAtPosition( position );

		if ( !lane ) return;

		const roodCoord = this.roadService.findRoadCoordAtPosition( position );

		const signal = this.signalFactory.createSignalFromAsset( asset, roodCoord, asset.name, type, subtype );

		return signal;

	}

	addRoadSignal ( road: TvRoad, signal: TvRoadSignal ) {

		const object3D = this.roadSignalService.buildSignal( road, signal );

		this.roadSignalService.addSignal( road, signal, object3D );

		this.createControlPoint( road, signal );

	}

	updateRoadSignal ( road: TvRoad, signal: TvRoadSignal ) {

		this.roadSignalService.updateSignal( road, signal );

		this.updateControlPoints( road );

	}

	removeRoadSignal ( road: TvRoad, signal: TvRoadSignal ) {

		this.roadSignalService.removeSignal( road, signal );

		this.points.remove( signal );

	}

	hideControls ( road: TvRoad ) {

		this.points.clear();

	}

	showControls ( road: TvRoad ) {

		for ( let signal of road.signals.values() ) {

			this.createControlPoint( road, signal );

		}

	}

	updateControlPoints ( road: TvRoad ) {

		for ( let signal of road.signals.values() ) {

			const controlPoint = this.points.get( signal );

			if ( controlPoint ) {

				const position = road.getPosThetaAt( signal.s, signal.t );

				controlPoint.position.copy( position.position );

			}

		}

	}

	createControlPoint ( road: TvRoad, signal: TvRoadSignal ) {

		const position = road.getPosThetaAt( signal.s, signal.t );

		const controlPoint = this.controlPointFactory.createSimpleControlPoint( signal, position.position );

		this.points.add( signal, controlPoint );

	}

}
