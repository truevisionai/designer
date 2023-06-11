/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { OscParameterDeclaration } from '../../models/osc-parameter-declaration';

@Component( {
	selector: 'app-osc-paramaters-inspector',
	templateUrl: './osc-paramaters-inspector.component.html',
	styleUrls: [ './osc-paramaters-inspector.component.css' ]
} )
export class OscParamatersInspectorComponent implements OnInit, IComponent {

	@Input() declaration: OscParameterDeclaration;

	data: any;

	constructor () {
	}

	get parameters () {
		return this.declaration.parameters;
	}

	ngOnInit () {
		this.declaration = this.data;
	}

}
