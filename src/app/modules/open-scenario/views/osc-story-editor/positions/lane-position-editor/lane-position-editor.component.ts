/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LanePosition } from '../../../../models/positions/osc-lane-position';
import { AbstractPositionEditor } from '../../position-editor/AbstractPositionEditor';

@Component( {
	selector: 'app-lane-position-editor',
	templateUrl: './lane-position-editor.component.html'
} )
export class LanePositionEditorComponent extends AbstractPositionEditor implements OnInit {

	@Input() position: LanePosition;

	public positionForm: FormGroup;

	constructor ( private fb: FormBuilder ) {
		super();
	}

	ngOnInit () {

		this.positionForm = this.fb.group( {
			roadId: [ this.position.roadId, [ Validators.required ] ],
			laneId: [ this.position.laneId, [ Validators.required ] ],
			sCoordinate: [ this.position.sCoordinate, [ Validators.required ] ],
			offset: [ this.position.offset, [] ],
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
