/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { AbstractTarget } from '../../../models/actions/abstract-target';
import { OscAbsoluteTarget } from '../../../models/actions/osc-absolute-target';
import { OscRelativeTarget } from '../../../models/actions/osc-relative-target';
import { TvScenarioInstance } from '../../../services/tv-scenario-instance';

@Component( {
	selector: 'app-target-editor',
	templateUrl: './target-editor.component.html',
	styleUrls: [ './target-editor.component.css' ]
} )
export class TargetEditorComponent {

	@Input() target: AbstractTarget;

	constructor () {
	}

	get entities () {

		return [ ...TvScenarioInstance.openScenario.objects.keys() ];

	}

	get relativeTarget () {

		return this.target as OscRelativeTarget;

	}

	get absoluteTarget () {

		return this.target as OscAbsoluteTarget;

	}

	onAbsoluteTargetChanged ( value: any ) {

		this.absoluteTarget.setTarget( value );

	}

	onRelativeTargetChanged ( value: any ) {

		this.relativeTarget.setTarget( value );

	}

}
