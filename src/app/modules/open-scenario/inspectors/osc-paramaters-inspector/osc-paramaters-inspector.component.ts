/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { ParameterDeclaration } from '../../models/osc-parameter-declaration';

@Component( {
	selector: 'app-osc-paramaters-inspector',
	templateUrl: './osc-paramaters-inspector.component.html',
	styleUrls: [ './osc-paramaters-inspector.component.css' ]
} )
export class ParamatersInspectorComponent implements OnInit, IComponent {

	@Input() declaration: ParameterDeclaration;

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
