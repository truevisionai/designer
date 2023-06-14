import { Component, Input, OnInit } from '@angular/core';
import { AbstractByEntityCondition } from '../../../../../models/conditions/abstract-by-entity-condition';

@Component( {
	selector: 'app-stand-still-condition-editor',
	templateUrl: './stand-still-condition-editor.component.html',
	styleUrls: [ './stand-still-condition-editor.component.scss' ]
} )
export class StandStillConditionEditorComponent implements OnInit {

	@Input() condition: AbstractByEntityCondition;

	constructor () {
	}

	ngOnInit () {
	}

}
