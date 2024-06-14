/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { DebugState } from "app/services/debug/debug-state";
import { BaseDebugger } from "../../core/interfaces/base-debugger";
import { TvRoad } from "../../map/models/tv-road.model";
import { RoadDebugService } from "../../services/debug/road-debug.service";
import { TvRoadObject } from "../../map/models/objects/tv-road-object";
import { ControlPointFactory } from "../../factories/control-point.factory";
import { Object3DArrayMap } from "../../core/models/object3d-array-map";
import { Object3D } from "three";
import { TvCornerRoad } from "../../map/models/objects/tv-corner-road";
import { SimpleControlPoint } from "../../objects/simple-control-point";

@Injectable( {
	providedIn: 'root'
} )
export class CrosswalkToolDebugger extends BaseDebugger<TvRoad> {

	private nodes = new Object3DArrayMap<TvRoad, Object3D[]>();

	private nodeCache = new Map<TvCornerRoad, CornerControlPoint>();

	constructor ( private roadDebugger: RoadDebugService, private pointFactory: ControlPointFactory ) {

		super();

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

		for ( const roadObject of road.objects.object ) {

			this.showRoadObject( road, roadObject );

		}

	}

	onUnselected ( road: TvRoad ): void {

		this.nodes.removeKey( road );

	}

	onDefault ( road: TvRoad ): void {

		this.nodes.removeKey( road );

	}

	onRemoved ( road: TvRoad ): void {

		this.nodes.removeKey( road );

	}

	showRoadObject ( road: TvRoad, roadObject: TvRoadObject ) {

		for ( const outline of roadObject.outlines ) {

			for ( const corner of outline.cornerRoad ) {

				const node = this.createNode( road, roadObject, corner );

				this.nodes.addItem( road, node );

			}

		}

	}

	createNode ( road: TvRoad, roadObject: TvRoadObject, corner: TvCornerRoad ) {

		const position = road.getPosThetaAt( corner.s, corner.t )

		let node: CornerControlPoint;

		if ( this.nodeCache.has( corner ) ) {

			node = this.nodeCache.get( corner );

			node.position.copy( position?.position );

		} else {

			node = new CornerControlPoint( road, road.objects.object[ 0 ], corner );

			this.nodeCache.set( corner, node );

		}

		return node;
	}
}

export class CornerControlPoint extends SimpleControlPoint<TvCornerRoad> {

	public corner: TvCornerRoad;

	constructor ( public road: TvRoad, public roadObject: TvRoadObject, cornerRoad: TvCornerRoad, ) {

		super( cornerRoad );

		this.corner = cornerRoad

	}

}
