import { Component, OnInit } from '@angular/core';
import { RoadFactory } from 'app/core/factories/road-factory.service';
import { IComponent } from 'app/core/game-object';
import { UpdateElevationDistance } from 'app/core/tools/road-elevation/update-elevation-distance';
import { UpdateElevationValue } from 'app/core/tools/road-elevation/update-elevation-value';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { RoadElevationNode } from 'app/modules/three-js/objects/road-elevation-node';
import { TvUtils } from 'app/modules/tv-map/models/tv-utils';
import { CommandHistory } from 'app/services/command-history';

@Component( {
	selector: 'app-road-elevation-inspector',
	templateUrl: './road-elevation-inspector.component.html',
	styleUrls: [ './road-elevation-inspector.component.scss' ]
} )
export class RoadElevationInspector implements OnInit, IComponent {

	data: RoadElevationNode;

	constructor () { }

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
