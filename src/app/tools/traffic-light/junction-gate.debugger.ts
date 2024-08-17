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
import { COLOR } from "../../views/shared/utils/colors.service";
import { RoadGeometryService } from 'app/services/road/road-geometry.service';

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

	private createLines ( signal: TvRoadSignal ) {

		const road = this.roadService.getRoad( signal.roadId );

		const signalPosition = RoadGeometryService.instance.findRoadPosition( road, signal.s, signal.t );

		for ( const dep of signal.dependencies ) {

			if ( dep.type != TvSignalDependencyType.TrafficLight ) continue;

			const trafficLight = road.getRoadSignalById( dep.id );

			if ( !trafficLight ) continue;

			const lightPosition = RoadGeometryService.instance.findRoadPosition( road, trafficLight.s, trafficLight.t )?.position;

			lightPosition.z += trafficLight.zOffset;

			const positions = [ signalPosition.position, lightPosition ];

			const line = this.debugService.createLine( positions, COLOR.WHITE, 4 );

			this.lines.addItem( signal, line );

		}

	}
}

