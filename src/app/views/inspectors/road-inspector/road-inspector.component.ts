/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CallFunctionCommand } from 'app/core/commands/call-function-command';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { CommandHistory } from 'app/services/command-history';
import { IComponent } from '../../../core/game-object';
import { TvMapBuilder } from '../../../modules/tv-map/builders/od-builder.service';
import { TvRoadType } from '../../../modules/tv-map/models/tv-common';
import { TvRoad } from '../../../modules/tv-map/models/tv-road.model';

@Component( {
	selector: 'app-road-inspector',
	templateUrl: './road-inspector.component.html',
	styles: [
		`
			.example-card {
				max-width: 400px;
			}

			.example-header-image {
				background-image: url('https://material.angular.io/assets/img/examples/shiba1.jpg');
				background-size: cover;
			}
		`
	]
} )
export class RoadInspector implements OnInit, OnDestroy, IComponent {

	data: {
		road: TvRoad,
		controlPoint: RoadControlPoint,
		node: RoadNode,
	};

	constructor () {
	}

	get road (): TvRoad {
		return this.data.road;
	}

	get controlPoint (): RoadControlPoint {
		return this.data.controlPoint;
	}

	get node (): RoadNode {
		return this.data.node;
	}

	get roadSpeed () {
		return this.roadType ? this.roadType.speed.max : null;
	}

	get roadTypesEnum () {
		return TvRoadType;
	}

	get type () {
		return this.roadType ? this.roadType.type : null;
	}

	get roadType () {
		return this.road ? this.road.getRoadTypeAt( 0 ) : null;
	}

	ngOnInit () {

		if ( this.road ) this.road.showHelpers();

		if ( this.controlPoint ) this.controlPoint.select();

		if ( this.data.node ) this.node.selected();

	}

	ngOnDestroy () {

		if ( this.road ) this.road.hideControlPoints();

		if ( this.road ) this.road.hideSpline();

		if ( this.controlPoint ) this.controlPoint.unselect();

		if ( this.data.node ) this.data.node.unselected();

	}

	onRoadSpeedChanged ( $value ) {

		CommandHistory.execute( new SetValueCommand( this.roadType.speed, 'max', $value ) );

	}

	onRoadTypeChanged ( $value: any ) {

		CommandHistory.execute( new SetValueCommand( this.roadType, 'type', $value ) );

	}

	onDrivingMaterialChanged ( $guid: string ) {

		CommandHistory.executeMany(

			new SetValueCommand( this.road, 'drivingMaterialGuid', $guid ),

			new CallFunctionCommand( this.road, this.road.updateLaneMaterial, null, this.road.updateLaneMaterial )

		)

	}

	onSidewalkMaterialChanged ( $guid: string ) {

		CommandHistory.executeMany(

			new SetValueCommand( this.road, 'sidewalkMaterialGuid', $guid ),

			new CallFunctionCommand( this.road, this.road.updateLaneMaterial, null, this.road.updateLaneMaterial )

		)
	}

	onBorderMaterialChanged ( $guid: string ) {

		CommandHistory.executeMany(

			new SetValueCommand( this.road, 'borderMaterialGuid', $guid ),

			new CallFunctionCommand( this.road, this.road.updateLaneMaterial, null, this.road.updateLaneMaterial )

		)
	}

	onShoulderMaterialChanged ( $guid: string ) {

		CommandHistory.executeMany(

			new SetValueCommand( this.road, 'shoulderMaterialGuid', $guid ),

			new CallFunctionCommand( this.road, this.road.updateLaneMaterial, null, this.road.updateLaneMaterial )

		)
	}
}
