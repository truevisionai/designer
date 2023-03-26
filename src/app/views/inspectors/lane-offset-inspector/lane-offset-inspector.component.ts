/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { BaseInspector } from 'app/core/components/base-inspector.component';
import { NodeFactoryService } from 'app/core/factories/node-factory.service';
import { IComponent } from 'app/core/game-object';
import { SceneService } from 'app/core/services/scene.service';
import { LaneOffsetNode } from 'app/modules/three-js/objects/control-point';
import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { COLOR } from 'app/shared/utils/colors.service';

export class LaneOffsetInspectorData {
	constructor ( public node: LaneOffsetNode, public road: TvRoad ) {
	}
}

@Component( {
	selector: 'app-lane-offset-inspector',
	templateUrl: './lane-offset-inspector.component.html'
} )
export class LaneOffsetInspector extends BaseInspector implements OnInit, IComponent, OnDestroy {

	public static valueChanged = new EventEmitter<LaneOffsetInspectorData>();

	public static offsetChanged = new EventEmitter<number>();
	public static distanceChanged = new EventEmitter<number>();

	public data: LaneOffsetInspectorData;

	public laneHelper = new OdLaneReferenceLineBuilder( null, LineType.SOLID, COLOR.MAGENTA );

	constructor () {

		super();

	}

	get laneOffset () {
		return this.data.node.laneOffset;
	}

	ngOnInit () {

		if ( this.data.node ) {

			this.data.node.point.select();

		}

		if ( this.data.road ) this.showNodes( this.data.road );
	}

	ngOnDestroy () {

		if ( this.data.node ) {

			this.data.node.point.unselect();

		}

		if ( this.data.road ) this.hideNodes( this.data.road );
	}

	onDistanceChanged ( $value: number ) {

		LaneOffsetInspector.distanceChanged.emit( $value );

	}

	onOffsetChanged ( $value ) {

		LaneOffsetInspector.offsetChanged.emit( $value );

	}

	private hideNodes ( road: TvRoad ): void {

		road.getLaneOffsets().forEach( laneOffset => {

			if ( laneOffset.mesh ) {

				laneOffset.mesh.visible = false;

			}

		} );

	}

	private showNodes ( road: TvRoad ) {

		road.getLaneOffsets().forEach( laneOffset => {

			if ( laneOffset.mesh ) {

				laneOffset.mesh.visible = true;

			} else {

				laneOffset.mesh = NodeFactoryService.createLaneOffsetNode( road, laneOffset );

				SceneService.add( laneOffset.mesh );

			}

		} );

	}
}
