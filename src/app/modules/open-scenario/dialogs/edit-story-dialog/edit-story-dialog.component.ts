import { Component, Inject, OnInit } from '@angular/core';
import { ChooseActionDialogComponent, ChooseActionDialogData } from '../choose-action-dialog/choose-action-dialog.component';
import { AbstractCondition } from '../../models/conditions/osc-condition';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { OscManeuver } from '../../models/osc-maneuver';
import { OscEditorComponent } from '../../views/osc-editor/osc-editor.component';
import { EditActionsDialogComponent, EditActionsDialogData } from '../edit-actions-dialog/edit-actions-dialog.component';
import { AbstractAction } from '../../models/osc-interfaces';
import { SetValueCommand } from '../../../three-js/commands/set-value-command';
import { OscConditionType } from '../../models/osc-enums';
import { OscEntityObject } from '../../models/osc-entities';
import { OscSourceFile } from '../../services/osc-source-file';
import { EnumTrajectoryDomain, OscPolylineShape, OscTrajectory, OscVertex } from '../../models/osc-trajectory';
import { OscWorldPosition } from '../../models/positions/osc-world-position';
import { Debug } from 'app/core/utils/debug';
import { OscEvent } from '../../models/osc-event';
import { OscFollowTrajectoryAction } from '../../models/actions/osc-follow-trajectory-action';

export class EditStoryDialogData {
    constructor ( public object: OscEntityObject ) {

    }
}


@Component( {
    selector: 'app-edit-story-dialog',
    templateUrl: './edit-story-dialog.component.html'
} )
export class EditStoryDialog implements OnInit {

    selectedManeuver: OscManeuver;
    selectedEvent: OscEvent;
    selectedAction: AbstractAction;

    conditionTypes: OscConditionType;

    maneuvers: OscManeuver[];

    constructor (
        public dialogRef: MatDialogRef<EditActionsDialogComponent>,
        @Inject( MAT_DIALOG_DATA ) public data: EditActionsDialogData,
        public dialog: MatDialog
    ) {

    }

    get openScenario () {
        return OscSourceFile.openScenario;
    }

    get entity () {
        return this.data.object;
    }

    get maneuver () {
        return this.maneuvers[ 0 ];
    }

    get event () {
        return this.maneuver.events[ 0 ];
    }

    get condition () {
        return this.event.startConditionGroups[ 0 ].conditions[ 0 ];
    }

    get eventActions () {
        if ( this.selectedEvent ) return this.selectedEvent.getActions();
    }

    get eventConditions () {
        if ( this.selectedEvent ) return this.selectedEvent.startConditions;
    }

    ngOnInit () {

        var stories = this.openScenario.getStoriesByOwner( this.entity.name );

        var sequences = this.openScenario.getSequencesByActor( this.entity.name );

        this.maneuvers = this.openScenario.getManeuversForEntity( this.entity.name );

        Debug.log( stories );

        Debug.log( sequences );

        Debug.log( this.maneuvers );

    }

    selectManeuver ( maneuver: OscManeuver ) {

        this.selectedManeuver = maneuver;

    }

    selectEvent ( event: OscEvent ) {

        this.selectedEvent = event;

    }

    selectAction ( action: AbstractAction ) {

    }

    onConditionChanged ( condition: AbstractCondition ) {

        const array = this.selectedEvent.startConditions;

        const index = 0;

        const cmd = ( new SetValueCommand( array, index, condition ) );

        OscEditorComponent.execute( cmd );

    }

    onActionSelected ( action: AbstractAction ) {

        this.selectedAction = action;

    }

    addAction () {

        const data = new ChooseActionDialogData();

        const dialogRef = this.dialog.open( ChooseActionDialogComponent, {
            width: '360px',
            data: data
        } );

        dialogRef.afterClosed().subscribe( ( response: ChooseActionDialogData ) => {

            Debug.log( 'dialog-closed', response );

            if ( response != null && response.action != null ) {

                this.selectedEvent.addNewAction( response.actionName, response.action );

            }

        } );

    }

    addManeuver () {

        // TODO : Check before adding

        const story = this.openScenario.storyboard.addNewStory( 'NewStory', this.entity.name );

        const act = story.addNewAct( 'NewAct' );

        const sequence = act.addNewSequence( 'NewSequence', 1, this.entity.name );

        const maneuver = sequence.addNewManeuver( 'NewManeuever' );

        const event = maneuver.addNewEvent( 'NewEvent', '100' );

        const trajectory = new OscTrajectory( 'NewTrajectory', false, EnumTrajectoryDomain.Distance );

        trajectory.vertices.push( new OscVertex( 0, new OscWorldPosition( 0, 0, 0 ), new OscPolylineShape ) );
        trajectory.vertices.push( new OscVertex( 1, new OscWorldPosition( 1, 1, 0 ), new OscPolylineShape ) );

        const action = event.addNewAction( 'NewAction', new OscFollowTrajectoryAction( trajectory ) );

        Debug.log( this.openScenario.storyboard );

        // let maneuver = new OscManeuver( 'NewManeuver' );

        // this.openScenario.addManeuver( this.entity.name, maneuver );

    }

}
