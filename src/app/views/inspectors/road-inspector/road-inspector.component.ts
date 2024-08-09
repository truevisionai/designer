/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseInspector } from 'app/core/components/base-inspector.component';
import { RoadNode } from 'app/objects/road-node';
import { CommandHistory } from 'app/commands/command-history';
import { Vector2, Vector3 } from 'three';
import { IComponent } from '../../../objects/game-object';
import { TvGeometryType, TvRoadType } from '../../../map/models/tv-common';
import { TvRoad } from '../../../map/models/tv-road.model';
import { RemoveObjectCommand } from 'app/commands/remove-object-command';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { DialogService } from 'app/services/dialog/dialog.service';
import { RoadStyle } from 'app/graphics/road-style/road-style.model';
import { AssetService } from 'app/core/asset/asset.service';
import { RoadService } from 'app/services/road/road.service';
import { UpdatePositionCommand } from "../../../commands/update-position-command";
import { Environment } from 'app/core/utils/environment';
import { TvConsole } from "../../../core/utils/console";
import { RoadControlPoint } from 'app/objects/road-control-point';
import { Commands } from 'app/commands/commands';

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

	isProduction = Environment.production;

	segmentTypes = TvGeometryType;

	constructor (
		private dialogService: DialogService,
		private assetService: AssetService,
		private roadService: RoadService,
	) {
		super();
	}

	get segmentType (): TvGeometryType {
		if ( this.controlPoint instanceof RoadControlPoint ) {
			return this.controlPoint.segmentType;
		}
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

	get controlPointPosition (): Vector2 {
		return new Vector2( this.controlPoint?.position.x || 0, this.controlPoint?.position.y || 0 );
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
		return this.road?.type.length > 0 ? this.road.type[ 0 ] : null;
	}

	ngOnInit () {


	}

	ngOnDestroy () {


	}

	async exportRoadStyle () {

		const saved = await this.dialogService.saveDialogSimple( 'RoadStyle', RoadStyle.extension );

		if ( !saved ) return;

		const style = RoadStyle.fromRoad( this.road );

		this.assetService.createRoadStyleAsset( saved.directory, style, saved.filename );

		TvConsole.info( 'Exporting road style to: ' + saved.filePath );

	}

	async duplicateRoad () {

		this.roadService.duplicateRoad( this.road );

	}

	onRoadSpeedChanged ( $value: number ) {

		Commands.SetValue( this.roadType.speed, 'max', $value );

	}

	onRoadTypeChanged ( $value: any ) {

		Commands.SetValue( this.roadType, 'type', $value );

	}

	onDrivingMaterialChanged ( $guid: string ) {

		Commands.SetValue( this.road, 'drivingMaterialGuid', $guid );

	}

	onSidewalkMaterialChanged ( $guid: string ) {

		Commands.SetValue( this.road, 'sidewalkMaterialGuid', $guid );

	}

	onBorderMaterialChanged ( $guid: string ) {

		Commands.SetValue( this.road, 'borderMaterialGuid', $guid );

	}

	onShoulderMaterialChanged ( $guid: string ) {

		Commands.SetValue( this.road, 'shoulderMaterialGuid', $guid );

	}

	onControlPointChanged ( $position: Vector2 ) {

		const newPosition = new Vector3( $position.x, $position.y, 0 );

		const oldPosition = this.controlPoint.position.clone();

		const updateCommand = new UpdatePositionCommand( this.controlPoint, newPosition, oldPosition );

		CommandHistory.execute( updateCommand );

	}

	onDelete (): void {

		if ( this.data?.controlPoint ) {

			this.onDeleteControlPoint();

		} else if ( this.data?.node ) {

		} else if ( this.data?.road ) {

			this.onDeleteSpline();

		}

	}

	onDeleteControlPoint () {

		if ( !this.data?.controlPoint ) return;

		CommandHistory.execute( new RemoveObjectCommand( this.data.controlPoint ) );

	}


	onDeleteSpline () {

		if ( !this.data?.road ) return;

		CommandHistory.execute( new RemoveObjectCommand( this.data.road.spline ) );

	}

}
