/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { IComponent } from 'app/objects/game-object';
import { ParameterDeclaration } from '../../models/tv-parameter-declaration';

@Component( {
	selector: 'app-tv-paramaters-inspector',
	templateUrl: './tv-paramaters-inspector.component.html',
	styleUrls: [ './tv-paramaters-inspector.component.css' ]
} )
export class ParamatersInspectorComponent implements OnInit, IComponent {

	@Input() declaration: ParameterDeclaration;

	data: any;

	constructor () {
	}

	ngOnInit (): void {
		this.declaration = this.data;
	}

}
