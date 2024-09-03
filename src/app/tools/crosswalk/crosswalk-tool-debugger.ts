/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvRoad } from "../../map/models/tv-road.model";
import { RoadDebugService } from "../../services/debug/road-debug.service";
import { TvRoadObject } from "../../map/models/objects/tv-road-object";
import { Object3DArrayMap } from "../../core/models/object3d-array-map";
import { TvCornerRoad } from "../../map/models/objects/tv-corner-road";
import { Log } from "../../core/utils/log";
import { RoadGeometryService } from "app/services/road/road-geometry.service";
import { DebugDrawService } from "app/services/debug/debug-draw.service";
import { TvObjectOutline } from "app/map/models/objects/tv-object-outline";
import { DebugLine } from "app/objects/debug-line";
import { Object3DMap } from "app/core/models/object3d-map";
import { CornerControlPoint } from "./objects/corner-control-point";

@Injectable( {
	providedIn: 'root'
} )
export class CrosswalkToolDebugger {

	private nodes: Object3DArrayMap<TvRoadObject, CornerControlPoint[]>;

	private lines: Object3DMap<TvRoadObject, DebugLine<TvRoadObject>>;

	private nodeCache: Map<TvCornerRoad, CornerControlPoint>;

	private lineCache: Map<TvRoadObject, DebugLine<any>>;

	constructor ( private roadDebugger: RoadDebugService, private debugService: DebugDrawService ) {

		this.nodeCache = new Map();

		this.lineCache = new Map();

		this.nodes = new Object3DArrayMap();

		this.lines = new Object3DMap();

	}

	addGizmo ( road: TvRoad, roadObject: TvRoadObject ): void {

		for ( const outline of roadObject.outlines ) {

			for ( const corner of outline.cornerRoads ) {

				const node = this.createNode( road, roadObject, corner );

				this.addPoint( roadObject, node );

			}

			if ( outline.getCornerRoadCount() > 1 ) {

				const line = this.createOrUpdateLine( road, roadObject, outline );

				this.lines.add( roadObject, line );

			}

		}

	}

	addPoint ( roadObject: TvRoadObject, point: CornerControlPoint ): void {

		this.nodes.addItem( roadObject, point );

	}

	removePoint ( roadObject: TvRoadObject, point: CornerControlPoint ): void {

		this.nodes.removeItem( roadObject, point );

	}

	updateGizmo ( road: TvRoad, roadObject: TvRoadObject ): void {

		for ( const outline of roadObject.outlines ) {

			if ( outline.getCornerRoadCount() > 1 ) {

				const line = this.createOrUpdateLine( road, roadObject, outline );

				if ( !this.lines.has( roadObject ) ) {

					this.lines.add( roadObject, line );

				}

			}

		}

	}

	getNodes ( roadObject: TvRoadObject ): CornerControlPoint[] {

		return this.nodes.getItems( roadObject );

	}

	removeGizmo ( roadObject: TvRoadObject ): void {

		this.nodes.removeKey( roadObject );

		this.lines.remove( roadObject );

	}

	removeAll ( road: TvRoad ): void {

		this.nodes.forEachKey( ( roadObject: TvRoadObject ) => {

			if ( roadObject.road == road ) {

				this.removeGizmo( roadObject );

			}

		} );

	}

	createNode ( road: TvRoad, roadObject: TvRoadObject, corner: TvCornerRoad ): CornerControlPoint {

		const position = RoadGeometryService.instance.findRoadPosition( road, corner.s, corner.t )

		if ( !position ) {
			Log.error( 'CrosswalkToolDebugger', 'createNode', 'Position not found' );
			return;
		}

		let node: CornerControlPoint;

		if ( this.nodeCache.has( corner ) ) {

			node = this.nodeCache.get( corner );

		} else {

			node = new CornerControlPoint( road, roadObject, corner );

			this.nodeCache.set( corner, node );

		}

		node.position.copy( position.position );

		return node;

	}

	createOrUpdateLine ( road: TvRoad, roadObject: TvRoadObject, outline: TvObjectOutline ): DebugLine<TvRoadObject> {

		const points = outline.cornerRoads.map( corner => RoadGeometryService.instance.findRoadPosition( road, corner.s, corner.t ) );

		let line: DebugLine<TvRoadObject>;

		if ( this.lineCache.has( roadObject ) ) {

			line = this.lineCache.get( roadObject );

			this.debugService.updateDebugLine( line, points.map( point => point.position ) )

		} else {

			line = this.debugService.createDebugLine( roadObject, points.map( point => point.position ) );

			this.lineCache.set( roadObject, line );

		}

		return line;

	}

	clear (): void {

		this.nodes.clear();

		this.lines.clear();

		this.roadDebugger.clear();

	}
}

