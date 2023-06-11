import { Component, OnInit } from '@angular/core';
import { OscSourceFile } from '../../../../services/osc-source-file';
import { AbstractPositionEditor } from '../../position-editor/AbstractPositionEditor';

@Component( {
	selector: 'app-relative-object-position-editor',
	templateUrl: './relative-object-position-editor.component.html',
} )
export class RelativeObjectPositionEditorComponent extends AbstractPositionEditor implements OnInit {

	constructor () {
		super();
	}

	// @Input() position: OscRelativeObjectPosition;

	get entities () {
		return [ ...OscSourceFile.openScenario.objects.keys() ];
	};

	ngOnInit () {

	}

}
