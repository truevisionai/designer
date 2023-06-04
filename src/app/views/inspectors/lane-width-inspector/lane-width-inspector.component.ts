/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { RemoveWidthNodeCommand } from 'app/core/commands/remove-width-node-command';
import { BaseInspector } from 'app/core/components/base-inspector.component';
import { IComponent } from 'app/core/game-object';
import { CommandHistory } from 'app/services/command-history';
import { UpdateWidthNodeDistanceCommand } from '../../../core/tools/lane-width/update-width-node-distance-command';
import { UpdateWidthNodeValueCommand } from '../../../core/tools/lane-width/update-width-node-value-command';
import { LineType, OdLaneReferenceLineBuilder } from '../../../modules/tv-map/builders/od-lane-reference-line-builder';
import { TvLaneWidth } from '../../../modules/tv-map/models/tv-lane-width';

@Component( {
	selector: 'app-lane-width-inspector',
	templateUrl: './lane-width-inspector.component.html'
} )
export class LaneWidthInspector extends BaseInspector implements OnInit, IComponent, OnDestroy {

	public static widthChanged = new EventEmitter<number>();
	public static distanceChanged = new EventEmitter<number>();

	data: TvLaneWidth;

	private laneHelper = new OdLaneReferenceLineBuilder();

	constructor () {

		super();

	}

	get width (): TvLaneWidth {
		return this.data;
	}

	ngOnInit () {

	}

	ngOnDestroy () {

	}

	onWidthChanged ( $value: number ) {

		CommandHistory.execute( new UpdateWidthNodeValueCommand( this.data.node, $value, null, this.laneHelper ) );

	}

	onDistanceChanged ( $value: number ) {

		CommandHistory.execute( ( new UpdateWidthNodeDistanceCommand( this.data.node, $value, null, this.laneHelper ) ) );

	}

	onDelete () {

		if ( this.data ) {

			CommandHistory.execute( new RemoveWidthNodeCommand( this.data.node ) );

		}

	}
}
