/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { AbstractFieldComponent } from '../../../core/components/abstract-field.component';
import { ScenarioInstance } from '../../../modules/scenario/services/scenario-instance';

@Component( {
	selector: 'app-select-entity-field',
	templateUrl: './select-entity-field.component.html',
	styleUrls: [ './select-entity-field.component.scss' ]
} )
export class SelectEntityFieldComponent extends AbstractFieldComponent implements OnInit {

	@Input() value: string;
	@Input() label: string = 'Entity';

	constructor () {
		super();
	}

	get entities () {
		return [ ...ScenarioInstance.scenario.objects.keys() ];
	}

	ngOnInit () {
	}

	onEntityChanged ( $entity: string ) {
		this.changed.emit( $entity );
	}
}
