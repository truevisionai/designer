/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { UpdateElevationDistance } from 'app/tools/road-elevation/update-elevation-distance';
import { UpdateElevationValue } from 'app/tools/road-elevation/update-elevation-value';
import { RoadElevationNode } from 'app/modules/three-js/objects/road-elevation-node';
import { CommandHistory } from 'app/services/command-history';

@Component( {
	selector: 'app-road-elevation-inspector',
	templateUrl: './road-elevation-inspector.component.html',
	styleUrls: [ './road-elevation-inspector.component.scss' ]
} )
export class RoadElevationInspector implements OnInit, IComponent {

	data: RoadElevationNode;

	constructor () {
	}

	ngOnInit () {

		console.log( this.data );

	}

	onDistanceChanged ( $value: number ) {

		CommandHistory.execute( new UpdateElevationDistance( this.data, $value ) );


	}

	onElevationChanged ( $value: number ) {

		CommandHistory.execute( new UpdateElevationValue( this.data, $value ) );

	}
}
