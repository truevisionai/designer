/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Debug } from 'app/core/utils/debug';
import { SnackBar } from 'app/services/snack-bar.service';
import { AbstractAction } from '../../models/abstract-action';
import { AbsoluteTarget } from '../../models/actions/tv-absolute-target';
import { FollowTrajectoryAction } from '../../models/actions/tv-follow-trajectory-action';
import { LaneChangeAction } from '../../models/actions/tv-lane-change-action';
import { SpeedDynamics } from '../../models/actions/tv-private-action';
import { SpeedAction } from '../../models/actions/tv-speed-action';
import { ActionCategory, DynamicsShape } from '../../models/tv-enums';
import { EnumTrajectoryDomain, Trajectory } from '../../models/tv-trajectory';

export class ChooseActionDialogData {
	constructor ( public actionName?: string, public action?: AbstractAction ) {
	}
}


@Component( {
	selector: 'app-choose-action-dialog',
	templateUrl: './choose-action-dialog.component.html',
	styleUrls: [ './choose-action-dialog.component.css' ]
} )
export class ChooseActionDialogComponent implements OnInit {

	public category: string;
	public action_type: string;

	constructor (
		public dialogRef: MatDialogRef<ChooseActionDialogComponent>,
		@Inject( MAT_DIALOG_DATA ) public data: ChooseActionDialogData,
		private snackBar: SnackBar
	) {

	}

	get categories () {
		return ActionCategory;
	}

	set action ( value ) {
		this.data.action = value;
	}

	ngOnInit () {

		Debug.log( this.data );

	}

	onCancel () {

		this.dialogRef.close();

	}

	onAddAction () {

		// if ( this.data.actionName == null ) this.snackBar.show( 'Please provied a name for action' );
		if ( this.data.actionName == null ) return;

		switch ( this.action_type ) {

			case 'lane_change':
				this.addLaneChangeAction();
				break;

			case 'speed_change':
				this.addSpeedChangeAction();
				break;

			// case 'distance': this.action = new DistanceAction(); break;

			case 'follow_trajectory':
				this.addFollowTrajectoryAction();
				break;

			default:
				break;
		}

	}

	addLaneChangeAction () {

		this.close( new LaneChangeAction() );

	}

	addFollowTrajectoryAction () {

		const trajectory = new Trajectory( 'NewTrajectory', false, EnumTrajectoryDomain.Time );

		const action = new FollowTrajectoryAction( trajectory );

		this.close( action );

	}

	addSpeedChangeAction () {

		const dynamics = new SpeedDynamics( DynamicsShape.step );

		const target = new AbsoluteTarget( 0 );

		const action = new SpeedAction( dynamics, target );

		this.close( action );
	}

	close ( action: AbstractAction ) {

		const data = new ChooseActionDialogData( this.data.actionName, action );

		this.dialogRef.close( data );

	}

}
