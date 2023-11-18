/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseInspector } from 'app/core/components/base-inspector.component';
import { SetValueCommand } from 'app/commands/set-value-command';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { CommandHistory } from 'app/services/command-history';
import { Vector3 } from 'three';
import { IComponent } from '../../../core/game-object';
import { TvRoadType } from '../../../modules/tv-map/models/tv-common';
import { TvRoad } from '../../../modules/tv-map/models/tv-road.model';
import { UpdatePositionCommand } from 'app/commands/copy-position-command';
import { RemoveObjectCommand } from 'app/commands/remove-object-command';
import { AbstractControlPoint } from 'app/modules/three-js/objects/abstract-control-point';

@Component( {
	selector: 'app-road-inspector',
	templateUrl: './road-inspector.component.html',
	styles: []
} )
export class RoadInspector extends BaseInspector implements OnInit, OnDestroy, IComponent {

	data: {
		road: TvRoad,
		controlPoint: AbstractControlPoint,
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

	get controlPoint (): AbstractControlPoint {
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


	}

	ngOnDestroy () {

	}

	onRoadSpeedChanged ( $value: number ) {

		CommandHistory.execute( new SetValueCommand( this.roadType.speed, 'max', $value ) );

	}

	onRoadTypeChanged ( $value: any ) {

		CommandHistory.execute( new SetValueCommand( this.roadType, 'type', $value ) );

	}

	onDrivingMaterialChanged ( $guid: string ) {

		CommandHistory.execute( new SetValueCommand( this.road, 'drivingMaterialGuid', $guid ) );

	}

	onSidewalkMaterialChanged ( $guid: string ) {

		CommandHistory.execute( new SetValueCommand( this.road, 'sidewalkMaterialGuid', $guid ) );

	}

	onBorderMaterialChanged ( $guid: string ) {

		CommandHistory.execute( new SetValueCommand( this.road, 'borderMaterialGuid', $guid ) );

	}

	onShoulderMaterialChanged ( $guid: string ) {

		CommandHistory.execute( new SetValueCommand( this.road, 'shoulderMaterialGuid', $guid ) );

	}

	onControlPointChanged ( $newPosition: Vector3 ) {

		const oldPosition = this.controlPoint.position.clone();

		const updateCommand = new UpdatePositionCommand( this.controlPoint, $newPosition, oldPosition );

		CommandHistory.execute( updateCommand );

	}

	onDelete (): void {

		CommandHistory.execute( new RemoveObjectCommand( this.road ) );

	}

}
