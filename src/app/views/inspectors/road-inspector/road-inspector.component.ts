/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CallFunctionCommand } from 'app/commands/call-function-command';
import { UpdateRoadPointCommand } from 'app/commands/update-road-point-command';
import { BaseInspector } from 'app/core/components/base-inspector.component';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { CommandHistory } from 'app/services/command-history';
import { Vector3 } from 'three';
import { IComponent } from '../../../core/game-object';
import { TvRoadType } from '../../../modules/tv-map/models/tv-common';
import { TvRoad } from '../../../modules/tv-map/models/tv-road.model';
import { RemoveRoadCommand } from 'app/tools/road/remove-road-command';
import { SetInspectorCommand } from 'app/commands/set-inspector-command';

@Component( {
	selector: 'app-road-inspector',
	templateUrl: './road-inspector.component.html',
	styles: []
} )
export class RoadInspector extends BaseInspector implements OnInit, OnDestroy, IComponent {

	data: {
		road: TvRoad,
		controlPoint: RoadControlPoint,
		node: RoadNode,
	};

	isOpen: boolean = true;

	constructor () {
		super();
	}

	get road (): TvRoad {
		return this.data.road;
	}

	get splineType () {
		return this.road?.spline?.type;
	}

	get controlPoint (): RoadControlPoint {
		return this.data.controlPoint;
	}

	get controlPointPosition (): Vector3 {
		return this.controlPoint?.position.clone();
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

		// if ( this.road ) this.road.showHelpers();

		// if ( this.controlPoint ) this.controlPoint.select();

		// if ( this.data.node ) this.node.select();

	}

	ngOnDestroy () {

		// if ( this.road ) this.road.hideControlPoints();

		// // if ( this.road ) this.road.hideSpline();

		// if ( this.controlPoint ) this.controlPoint.unselect();

		// if ( this.data.node ) this.data.node.unselect();

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
		);

	}

	onSidewalkMaterialChanged ( $guid: string ) {

		CommandHistory.executeMany(
			new SetValueCommand( this.road, 'sidewalkMaterialGuid', $guid ),

			new CallFunctionCommand( this.road, this.road.updateLaneMaterial, null, this.road.updateLaneMaterial )
		);
	}

	onBorderMaterialChanged ( $guid: string ) {

		CommandHistory.executeMany(
			new SetValueCommand( this.road, 'borderMaterialGuid', $guid ),

			new CallFunctionCommand( this.road, this.road.updateLaneMaterial, null, this.road.updateLaneMaterial )
		);
	}

	onShoulderMaterialChanged ( $guid: string ) {

		CommandHistory.executeMany(
			new SetValueCommand( this.road, 'shoulderMaterialGuid', $guid ),

			new CallFunctionCommand( this.road, this.road.updateLaneMaterial, null, this.road.updateLaneMaterial )
		);
	}

	onControlPointChanged ( $controlPoint: Vector3 ) {

		CommandHistory.execute( new UpdateRoadPointCommand( this.road, this.controlPoint, $controlPoint, this.controlPoint.position ) );

	}

	onDelete (): void {

		this.delete();

	}

	delete () {

		if ( !this.road ) return;

		CommandHistory.executeMany(
			new RemoveRoadCommand( this.road ),
			new SetInspectorCommand( null, null )
		);
	}
}
