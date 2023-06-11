/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Debug } from 'app/core/utils/debug';
import { ThreeService } from 'app/modules/three-js/three.service';
import { PositionAction } from '../../models/actions/osc-position-action';
import { AbstractPosition } from '../../models/osc-interfaces';
import { LanePosition } from '../../models/positions/osc-lane-position';
import { RoadPosition } from '../../models/positions/osc-road-position';
import { WorldPosition } from '../../models/positions/osc-world-position';

export class EditPositionDialogData {
	public positionAction: PositionAction;
}

@Component( {
	selector: 'app-edit-position-dialog',
	templateUrl: './edit-position-dialog.component.html'
} )
export class EditPositionDialogComponent implements OnInit {

	roadId: number;
	laneId: number;
	sCoordinate: number;
	tCoordinate: number;

	selectedType: string;

	types: string[] = [
		'absolute_position',
		'road_position',
		'lane_position',
		'route',
	];

	constructor (
		public dialogRef: MatDialogRef<EditPositionDialogComponent>,
		@Inject( MAT_DIALOG_DATA ) public data: EditPositionDialogData,
		private threeService: ThreeService
	) {
	}

	get response () {

		return new PositionAction( this.position );

	}

	get position () {

		var position: AbstractPosition = null;

		switch ( this.selectedType ) {

			case 'absolute_position':
				position = new WorldPosition();
				break;

			case 'road_position':
				position = new RoadPosition( this.roadId, this.sCoordinate, this.tCoordinate );
				break;

			case 'lane_position':
				position = new LanePosition( this.roadId, this.laneId, this.sCoordinate, this.tCoordinate );
				break;

			default:
				break;
		}

		return position;
	}

	ngOnInit () {

		Debug.log( 'init', this.data );

	}

}
