import { Component, Input, OnInit } from '@angular/core';
import { OscLanePosition } from '../../../../models/positions/osc-lane-position';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AbstractPositionEditor } from '../../position-editor/position-editor.component';

@Component( {
    selector: 'app-lane-position-editor',
    templateUrl: './lane-position-editor.component.html'
} )
export class LanePositionEditorComponent extends AbstractPositionEditor implements OnInit {

    @Input() position: OscLanePosition;

    public positionForm: FormGroup;

    constructor ( private fb: FormBuilder ) {
        super();
    }

    ngOnInit () {

        this.positionForm = this.fb.group( {
            roadId: [this.position.roadId, [Validators.required]],
            laneId: [this.position.laneId, [Validators.required]],
            sCoordinate: [this.position.sCoordinate, [Validators.required]],
            offset: [this.position.offset, []],
        } );

        this.positionForm.valueChanges.subscribe( value => {

            this.position.roadId = value.roadId;
            this.position.laneId = value.laneId;
            this.position.offset = value.offset;
            this.position.sCoordinate = value.sCoordinate;

            this.positionModified.emit( this.position );

        } );

    }

}
