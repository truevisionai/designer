import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { OscEntityObject } from '../../models/osc-entities';
import { OscManeuver } from '../../models/osc-maneuver';
import { AbstractCondition } from '../../models/conditions/osc-condition';
import { AbstractAction } from '../../models/osc-interfaces';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { OscEditorComponent } from '../../views/osc-editor/osc-editor.component';
import { ChooseActionDialogComponent, ChooseActionDialogData } from '../choose-action-dialog/choose-action-dialog.component';
import { OscConditionType } from '../../models/osc-enums';
import { OscSourceFile } from '../../services/osc-source-file';
import { Debug } from 'app/core/utils/debug';
import { OscEvent } from '../../models/osc-event';

export class EditActionsDialogData {
    constructor ( public object: OscEntityObject ) {

    }
}

@Component( {
    selector: 'app-edit-actions-dialog',
    templateUrl: './edit-actions-dialog.component.html'
} )
export class EditActionsDialogComponent implements OnInit {

    selectedManeuver: OscManeuver;
    selectedEvent: OscEvent;
    selectedAction: AbstractAction;

    conditionTypes: OscConditionType;

    maneuvers: OscManeuver[];

    get entity () {
        return this.data.object;
    }

    get maneuver () {
        return this.maneuvers[0];
    }

    get event () {
        return this.maneuver.events[0];
    }

    get condition () {
        return this.event.startConditionGroups[0].conditions[0];
    }

    constructor (
        public dialogRef: MatDialogRef<EditActionsDialogComponent>,
        @Inject( MAT_DIALOG_DATA ) public data: EditActionsDialogData,
        public dialog: MatDialog
    ) {

    }

    get eventActions () {
        if ( this.selectedEvent ) return this.selectedEvent.getActions();
    }

    selectManeuver ( maneuver: OscManeuver ) {

        this.selectedManeuver = maneuver;

    }

    selectEvent ( event: OscEvent ) {

        this.selectedEvent = event;

    }

    selectAction ( action: AbstractAction ) {

    }

    ngOnInit () {

        var stories = OscSourceFile.openScenario.getStoriesByOwner( this.entity.name );

        var sequences = OscSourceFile.openScenario.getSequencesByActor( this.entity.name );

        this.maneuvers = OscSourceFile.openScenario.getManeuversForEntity( this.entity.name );

        Debug.log( stories );

        Debug.log( sequences );

        Debug.log( this.maneuvers );

    }

    get eventConditions () {
        if ( this.selectedEvent ) return this.selectedEvent.startConditions;
    }

    onConditionChanged ( condition: AbstractCondition ) {

        const array = this.selectedEvent.startConditions;

        const index = 0;

        const cmd = (new SetValueCommand( array, index, condition ));

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

            if ( response.action != null ) {

                this.selectedEvent.addNewAction( response.actionName, response.action );

            }

        } );

    }

}
