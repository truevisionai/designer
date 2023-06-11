import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AbstractAction } from 'app/modules/open-scenario/models/osc-interfaces';
import { OscSpeedDynamics } from '../../models/actions/osc-private-action';
import { SnackBar } from 'app/services/snack-bar.service';
import { OscSpeedAction } from '../../models/actions/osc-speed-action';
import { OscDistanceAction } from '../../models/actions/osc-distance-action';
import { OscLaneChangeAction } from '../../models/actions/osc-lane-change-action';
import { OscAbsoluteTarget } from '../../models/actions/osc-absolute-target';
import { OscActionCategory, OscDynamicsShape } from '../../models/osc-enums';
import { EnumTrajectoryDomain, OscTrajectory } from '../../models/osc-trajectory';
import { Debug } from 'app/core/utils/debug';
import { OscFollowTrajectoryAction } from '../../models/actions/osc-follow-trajectory-action';

export class ChooseActionDialogData {
    constructor ( public actionName?: string, public action?: AbstractAction ) { }
}


@Component( {
    selector: 'app-choose-action-dialog',
    templateUrl: './choose-action-dialog.component.html',
    styleUrls: [ './choose-action-dialog.component.css' ]
} )
export class ChooseActionDialogComponent implements OnInit {

    public category: string;
    public action_type: string;

    get categories () { return OscActionCategory; }

    set action ( value ) { this.data.action = value; }

    constructor (
        public dialogRef: MatDialogRef<ChooseActionDialogComponent>,
        @Inject( MAT_DIALOG_DATA ) public data: ChooseActionDialogData,
        private snackBar: SnackBar
    ) {

    }

    ngOnInit () {

        Debug.log( this.data );

    }

    onCancel () {

        this.dialogRef.close();

    }

    onAddAction () {

        if ( this.data.actionName == null ) this.snackBar.open( 'Please provied a name for action' );
        if ( this.data.actionName == null ) return;

        switch ( this.action_type ) {

            case 'lane_change': this.addLaneChangeAction(); break;

            case 'speed_change': this.addSpeedChangeAction(); break;

            // case 'distance': this.action = new OscDistanceAction(); break;

            case 'follow_trajectory': this.addFollowTrajectoryAction(); break;

            default:
                break;
        }

    }

    addLaneChangeAction () {

        this.close( new OscLaneChangeAction() );

    }

    addFollowTrajectoryAction () {

        const trajectory = new OscTrajectory( 'NewTrajectory', false, EnumTrajectoryDomain.Time );

        const action = new OscFollowTrajectoryAction( trajectory );

        this.close( action );

    }

    addSpeedChangeAction () {

        const dynamics = new OscSpeedDynamics( OscDynamicsShape.step );

        const target = new OscAbsoluteTarget( 0 );

        const action = new OscSpeedAction( dynamics, target );

        this.close( action );
    }

    close ( action: AbstractAction ) {

        const data = new ChooseActionDialogData( this.data.actionName, action );

        this.dialogRef.close( data );

    }

}
