import { Component, Input, OnInit } from '@angular/core';
import { EntityCondition } from '../../../models/conditions/entity-condition';

@Component( {
	selector: 'app-stand-still-condition-editor',
	templateUrl: './stand-still-condition-editor.component.html',
	styleUrls: [ './stand-still-condition-editor.component.scss' ]
} )
export class StandStillConditionEditorComponent implements OnInit {

	@Input() condition: EntityCondition;

	constructor () {
	}

	ngOnInit () {
	}

}
