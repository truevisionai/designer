/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

import { RemoveRoadmarkCommand } from '../../../core/commands/remove-roadmark-command';
import { SetRoadmarkValueCommand } from '../../../core/commands/set-roadmark-value-command';
import { BaseInspector } from '../../../core/components/base-inspector.component';
import { IComponent } from '../../../core/game-object';
import { TvRoadMarkTypes } from '../../../modules/tv-map/models/tv-common';
import { TvLaneRoadMark } from '../../../modules/tv-map/models/tv-lane-road-mark';
import { CommandHistory } from '../../../services/command-history';

@Component( {
	selector: 'app-lane-roadmark-inspector',
	templateUrl: './lane-roadmark-inspector.component.html',
	styleUrls: [ './lane-roadmark-inspector.component.css' ]
} )
export class LaneRoadmarkInspectorComponent extends BaseInspector implements OnInit, IComponent, OnDestroy {

	data: TvLaneRoadMark;

	constructor () {
		super();
	}

	get roadMark () {
		return this.data;
	}

	get lane () {
		return this.data;
	}

	get types () {
		return TvRoadMarkTypes;
	}

	// get roadmarks (): OdLaneRoadMark[] {
	//     return this.data.getLaneRoadMarkVector();
	// }

	ngOnInit () {


	}

	ngOnDestroy () {


	}

	onDelete () {

		CommandHistory.execute( new RemoveRoadmarkCommand( this.roadMark, this.roadMark.lane ) );

	}

	onWidthChanged ( value: number, item: TvLaneRoadMark ) {

		if ( item.width == value ) return;

		CommandHistory.execute( ( new SetRoadmarkValueCommand( item, 'width', value ) ) );

	}

	onTypeChanged ( $event: MatSelectChange, item: TvLaneRoadMark ) {

		if ( item.type == $event.value ) return;

		CommandHistory.execute( ( new SetRoadmarkValueCommand( item, 'type', $event.value ) ) );

	}

	onWeightChanged ( $event: MatSelectChange, item: TvLaneRoadMark ) {

		if ( item.weight == $event.value ) return;

		CommandHistory.execute( ( new SetRoadmarkValueCommand( item, 'weight', $event.value ) ) );

	}

	onColorChanged ( $event: MatSelectChange, item: TvLaneRoadMark ) {

		if ( item.color == $event.value ) return;

		CommandHistory.execute( ( new SetRoadmarkValueCommand( item, 'color', $event.value ) ) );

	}
}
