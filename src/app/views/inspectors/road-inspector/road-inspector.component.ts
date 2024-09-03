/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseInspector } from 'app/core/components/base-inspector.component';
import { RoadNode } from 'app/objects/road/road-node';
import { Vector2, Vector3 } from 'three';
import { IComponent } from '../../../objects/game-object';
import { TvGeometryType, TvRoadType } from '../../../map/models/tv-common';
import { TvRoad } from '../../../map/models/tv-road.model';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { DialogService } from 'app/services/dialog/dialog.service';
import { RoadStyle } from 'app/graphics/road-style/road-style.model';
import { AssetService } from 'app/core/asset/asset.service';
import { RoadService } from 'app/services/road/road.service';
import { Environment } from 'app/core/utils/environment';
import { TvConsole } from "../../../core/utils/console";
import { Commands } from 'app/commands/commands';
import { AbstractSpline } from "../../../core/shapes/abstract-spline";
import { TvRoadTypeClass } from "../../../map/models/tv-road-type.class";

export class RoadInspectorData {
	spline: AbstractSpline;
	controlPoint?: AbstractControlPoint;
	node?: RoadNode;
}

@Component( {
	selector: 'app-road-inspector',
	templateUrl: './road-inspector.component.html',
	styles: []
} )
export class RoadInspector extends BaseInspector implements OnInit, OnDestroy, IComponent {

	data: RoadInspectorData;

	isOpen: boolean = true;

	isProduction = Environment.production;

	segmentTypes = TvGeometryType;

	road: TvRoad;

	roadTypesEnum = TvRoadType;

	roadType?: TvRoadTypeClass;

	type?: TvRoadType;

	controlPoint?: AbstractControlPoint;

	segmentType?: TvGeometryType;

	roadSpeed?: number;

	constructor (
		private dialogService: DialogService,
		private assetService: AssetService,
		private roadService: RoadService,
	) {
		super();
	}

	ngOnInit (): void {

		if ( this.data.spline.getRoadSegments().length == 0 ) {
			throw new Error( 'Road Inspector: No road segments found' );
		}

		this.road = this.data.spline.getRoadSegments()[ 0 ];

		this.roadType = this.road?.type.length > 0 ? this.road.type[ 0 ] : null;

		this.type = this.roadType ? this.roadType.type : null;

		this.roadSpeed = this.roadType ? this.roadType.speed.max : 0;

		this.controlPoint = this.data.controlPoint;

		this.segmentType = this.controlPoint ? this.controlPoint[ 'segmentType' ] : null;

	}

	ngOnDestroy (): void {


	}

	async exportRoadStyle () {

		const saved = await this.dialogService.saveDialogSimple( 'RoadStyle', RoadStyle.extension );

		if ( !saved ) return;

		const style = RoadStyle.fromRoad( this.road );

		this.assetService.createRoadStyleAsset( saved.directory, style, saved.filename );

		TvConsole.info( `Exporting road style to: ${ saved.filePath }` );

	}

	duplicateRoad (): void {

		this.roadService.duplicateRoad( this.road );

	}

	onRoadSpeedChanged ( $value: number ): void {

		Commands.SetValue( this.roadType.speed, 'max', $value );

	}

	onRoadTypeChanged ( $value: any ): void {

		Commands.SetValue( this.roadType, 'type', $value );

	}

	onDrivingMaterialChanged ( $guid: string ): void {

		Commands.SetValue( this.road, 'drivingMaterialGuid', $guid );

	}

	onSidewalkMaterialChanged ( $guid: string ): void {

		Commands.SetValue( this.road, 'sidewalkMaterialGuid', $guid );

	}

	onBorderMaterialChanged ( $guid: string ): void {

		Commands.SetValue( this.road, 'borderMaterialGuid', $guid );

	}

	onShoulderMaterialChanged ( $guid: string ): void {

		Commands.SetValue( this.road, 'shoulderMaterialGuid', $guid );

	}

	onControlPointChanged ( $position: Vector3 ): void {

		const newPosition = new Vector3( $position.x, $position.y, 0 );

		const oldPosition = this.data.controlPoint.position.clone();

		Commands.UpdatePosition( this.data.controlPoint, newPosition, oldPosition );

	}

	onDelete (): void {

		// dont need this callback as tool class had onKeydown method

	}

	deleteControlPoint ( point: AbstractControlPoint ): void {

		Commands.RemoveObject( point );

	}

	deleteSpline ( spline: AbstractSpline ): void {

		Commands.RemoveObject( spline );

	}

}
