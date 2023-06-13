/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { AbstractTarget } from '../../../models/actions/abstract-target';
import { AbsoluteTarget } from '../../../models/actions/osc-absolute-target';
import { RelativeTarget } from '../../../models/actions/osc-relative-target';
import { TvScenarioInstance } from '../../../services/tv-scenario-instance';

@Component( {
	selector: 'app-target-editor',
	templateUrl: './target-editor.component.html',
	styleUrls: [ './target-editor.component.css' ]
} )
export class TargetEditorComponent implements OnInit {

	@Input() target: AbstractTarget;

	constructor () {

	}

	ngOnInit (): void {



	}

	get entities () {

		return [ ...TvScenarioInstance.openScenario.objects.keys() ];

	}

	get relativeTarget () {

		return this.target as RelativeTarget;

	}

	get absoluteTarget () {

		return this.target as AbsoluteTarget;

	}

	onAbsoluteTargetChanged ( value: any ) {

		this.absoluteTarget.setTarget( value );

	}

	onRelativeTargetChanged ( value: any ) {

		this.relativeTarget.setTarget( value );

	}

	onValueChanged ( $event: any ) {

		this.target.setTarget( $event );

	}
}
