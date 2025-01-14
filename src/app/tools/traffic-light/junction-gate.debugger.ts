/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseDebugger } from "../../core/interfaces/base-debugger";
import { DebugState } from "../../services/debug/debug-state";
import { TvRoadSignal, TvSignalDependencyType } from "../../map/road-signal/tv-road-signal.model";
import { Object3DArrayMap } from "../../core/models/object3d-array-map";
import { Object3D } from "three";
import { DebugDrawService } from "../../services/debug/debug-draw.service";
import { RoadService } from "../../services/road/road.service";
import { ColorUtils } from "../../views/shared/utils/colors.service";
import { Log } from 'app/core/utils/log';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionGateDebugger extends BaseDebugger<TvRoadSignal> {

	private lines = new Object3DArrayMap<TvRoadSignal, Object3D[]>();

	constructor (
		private debugService: DebugDrawService,
		private roadService: RoadService,
	) {
		super();
	}

	setDebugState ( object: TvRoadSignal, state: DebugState ): void {

		this.setBaseState( object, state );

	}

	onHighlight ( object: TvRoadSignal ): void {

		//

	}

	onUnhighlight ( object: TvRoadSignal ): void {

		//

	}

	onSelected ( object: TvRoadSignal ): void {

		this.createLines( object );

	}

	onUnselected ( object: TvRoadSignal ): void {

		this.lines.removeKey( object );

	}

	onDefault ( object: TvRoadSignal ): void {

		//

	}

	onRemoved ( object: TvRoadSignal ): void {

		//

	}

	private createLines ( signal: TvRoadSignal ): void {

		for ( const dependency of signal.dependencies ) {

			if ( dependency.type != TvSignalDependencyType.TrafficLight ) continue;

			try {

				const trafficLight = signal.getRoad().getRoadSignal( dependency.id );

				const positions = [
					signal.getPosition().toVector3(),
					trafficLight.getPosition().toVector3()
				];

				const line = this.debugService.createLine( positions, ColorUtils.WHITE, 4 );

				this.lines.addItem( signal, line );

			} catch ( error ) {

				Log.error( error );

			}

		}

	}
}

