import { Component, Input } from '@angular/core';
import { AbstractTarget } from '../../../models/actions/abstract-target';
import { OscAbsoluteTarget } from '../../../models/actions/osc-absolute-target';
import { OscRelativeTarget } from '../../../models/actions/osc-relative-target';
import { OscSourceFile } from '../../../services/osc-source-file';

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

		return [ ...OscSourceFile.openScenario.objects.keys() ];

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
