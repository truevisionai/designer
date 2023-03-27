/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { RemoveSignalCommand } from '../../../core/commands/remove-signal-command';
import { TvRoadSignal } from '../../../modules/tv-map/models/tv-road-signal.model';
import { TvMapInstance } from '../../../modules/tv-map/services/tv-map-source-file';
import { CommandHistory } from '../../../services/command-history';

@Component( {
	selector: 'app-signal-inspector',
	templateUrl: './signal-inspector.component.html',
} )
export class OdSignalInspectorComponent implements OnInit, IComponent {

	data: TvRoadSignal;

	constructor () {
	}

	// TODO: Get this properly
	get signMaterial () {
		return this.data.gameObject.children[ 0 ].children[ 0 ][ 'material' ];
	}

	get model () {
		return this.data.assetName.attr_value;
	}

	ngOnInit () {
	}

	updatePosition ( $event: number ) {

		const road = TvMapInstance.map.getRoadById( this.data.roadId );

		const pose = road.getPositionAt( this.data.s, this.data.t );

		this.data.gameObject.position.set( pose.x, pose.y, 0 );

	}

	onDelete () {

		CommandHistory.execute( new RemoveSignalCommand( this.data ) );

	}

}
