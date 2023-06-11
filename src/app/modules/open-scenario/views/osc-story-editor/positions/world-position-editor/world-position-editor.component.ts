/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OscWorldPosition } from 'app/modules/open-scenario/models/positions/osc-world-position';
import { ThreeService } from '../../../../../three-js/three.service';
import { OscSourceFile } from '../../../../services/osc-source-file';
import { AbstractPositionEditor } from '../../position-editor/AbstractPositionEditor';

@Component( {
	selector: 'app-world-position-editor',
	templateUrl: './world-position-editor.component.html'
} )
export class WorldPositionEditorComponent extends AbstractPositionEditor implements OnInit {

	@Input() position: OscWorldPosition;
	public positionGroup: FormGroup;

	constructor ( private fb: FormBuilder, private threeService: ThreeService ) {

		super();
	}

	get entities () {
		return [ ...OscSourceFile.openScenario.objects.keys() ];
	};

	get vector () {
		return this.position.vector3;
	}

	ngOnInit () {

		this.positionGroup = this.fb.group( {
			x: [ this.position.x ],
			y: [ this.position.y ],
			z: [ this.position.z ],
			h: [ this.position.h ],
			p: [ this.position.p ],
			r: [ this.position.r ],
		} );

		this.positionGroup.valueChanges.subscribe( ( value: OscWorldPosition ) => {

			this.position.x = value.x;
			this.position.y = value.y;
			this.position.z = value.z;
			this.position.h = value.h;
			this.position.p = value.p;
			this.position.r = value.r;

			this.positionModified.emit( this.position );

		} );
	}

	onModelChanged ( $event ) {

		this.positionModified.emit( this.position );

	}
}
