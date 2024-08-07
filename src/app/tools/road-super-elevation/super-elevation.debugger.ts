/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseDebugger } from 'app/core/interfaces/base-debugger';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { TvSuperElevation } from 'app/map/models/tv-lateral.profile';
import { TvRoad } from 'app/map/models/tv-road.model';
import { SimpleControlPoint } from 'app/objects/simple-control-point';
import { DebugState } from 'app/services/debug/debug-state';
import { Vector3 } from 'three';
import { Object3DArrayMap } from "../../core/models/object3d-array-map";
import { DebugLine } from "../../objects/debug-line";
import { DebugDrawService } from "../../services/debug/debug-draw.service";
import { RoadDebugService } from 'app/services/debug/road-debug.service';
import { Log } from 'app/core/utils/log';


@Injectable( {
	providedIn: 'root'
} )
export class SuperElevationDebugger extends BaseDebugger<TvRoad> {

	private pointCache: Map<TvSuperElevation, SimpleControlPoint<TvSuperElevation>>;
	private points: Object3DArrayMap<TvRoad, SimpleControlPoint<TvSuperElevation>[]>

	private nodeLines: Object3DArrayMap<TvRoad, DebugLine<TvSuperElevation>[]>
	private nodeCache: Map<TvSuperElevation, DebugLine<TvSuperElevation>>;

	private spanLines: Object3DArrayMap<TvRoad, DebugLine<TvSuperElevation>[]>
	private spanCache: Map<TvSuperElevation, DebugLine<TvSuperElevation>>;

	constructor (
		private debugService: DebugDrawService,
		private roadDebugger: RoadDebugService,
	) {

		super();

		this.pointCache = new Map();
		this.spanCache = new Map();
		this.nodeCache = new Map();

		this.points = new Object3DArrayMap();
		this.spanLines = new Object3DArrayMap();
		this.nodeLines = new Object3DArrayMap();

	}

	setDebugState ( road: TvRoad, state: DebugState ): void {
		this.setBaseState( road, state );
	}

	onHighlight ( road: TvRoad ): void {

		this.roadDebugger.showRoadBorderLine( road );

	}

	onUnhighlight ( road: TvRoad ): void {

		this.roadDebugger.removeRoadBorderLine( road );

	}

	onSelected ( road: TvRoad ): void {

		for ( const elevation of road.lateralProfile.superElevations.toArray() ) {

			this.points.addItem( road, this.createNode( road, elevation ) );

			const nodeLine = this.createNodeLine( road, elevation );

			if ( nodeLine ) this.nodeLines.addItem( road, nodeLine );

			// const spanLine = this.createSpanLine( road, elevation )

			// if ( spanLine ) this.spanLines.addItem( road, spanLine );

		}

	}

	onUnselected ( road: TvRoad ): void {

		this.points.removeKey( road );

		this.spanLines.removeKey( road );

		this.nodeLines.removeKey( road );

	}

	onDefault ( road: TvRoad ): void {
		//
	}

	onRemoved ( road: TvRoad ): void {

		this.points.removeKey( road );

		this.spanLines.removeKey( road );

		this.nodeLines.removeKey( road );

	}

	createNode ( road: TvRoad, superElevation: TvSuperElevation ) {

		const posTheta = road.getPosThetaAt( superElevation.s );

		if ( !posTheta ) {
			Log.error( 'SuperElevationDebugger', 'createNode', 'posTheta is undefined' );
			return ControlPointFactory.createSimpleControlPoint( superElevation, new Vector3() );
		}

		let point: SimpleControlPoint<TvSuperElevation>;

		if ( this.pointCache.has( superElevation ) ) {

			point = this.pointCache.get( superElevation );

			point.position.copy( posTheta.position );

		} else {

			point = ControlPointFactory.createSimpleControlPoint( superElevation, posTheta.position );

			this.pointCache.set( superElevation, point );

		}

		point.userData.superElevation = superElevation;
		point.userData.road = road;

		return point;
	}

	createSpanLine ( road: TvRoad, superElevation: TvSuperElevation ) {

		const next = road.lateralProfile.superElevations.getNext( superElevation );

		if ( !next ) return;

		const sStart = superElevation.s;

		const sEnd = next?.s || road.length;

		const points = this.debugService.getRoadPositions( road, sStart, sEnd ).map( point => point.position );

		let line: DebugLine<TvSuperElevation>;

		if ( this.spanCache.has( superElevation ) ) {

			line = this.spanCache.get( superElevation );

			this.debugService.updateDebugLine( line, points );

		} else {

			line = this.debugService.createDebugLine( superElevation, points );

			this.spanCache.set( superElevation, line );

		}

		line.userData.superElevation = superElevation;
		line.userData.road = road;

		return line;

	}

	createNodeLine ( road: TvRoad, superElevation: TvSuperElevation ) {

		let line: DebugLine<TvSuperElevation>;

		if ( this.nodeCache.has( superElevation ) ) {

			line = this.nodeCache.get( superElevation );

			this.debugService.updateRoadWidthLinev2( line, road, superElevation.s );

		} else {

			line = this.debugService.createRoadWidthLinev2( road, superElevation.s, superElevation, 4 );

			this.nodeCache.set( superElevation, line );

		}

		line.userData.superElevation = superElevation;
		line.userData.road = road;

		return line;
	}

	clear () {

		super.clear();

		this.points.clear();

		this.nodeLines.clear();

		this.spanLines.clear();

		this.roadDebugger.clear();

	}
}
