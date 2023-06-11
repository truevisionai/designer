/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { TvScenarioInstance } from '../../../../services/tv-scenario-instance';
import { AbstractPositionEditor } from '../../position-editor/AbstractPositionEditor';

@Component( {
	selector: 'app-relative-object-position-editor',
	templateUrl: './relative-object-position-editor.component.html',
} )
export class RelativeObjectPositionEditorComponent extends AbstractPositionEditor implements OnInit {

	constructor () {
		super();
	}

	// @Input() position: RelativeObjectPosition;

	get entities () {
		return [ ...TvScenarioInstance.openScenario.objects.keys() ];
	};

	ngOnInit () {

	}

}
