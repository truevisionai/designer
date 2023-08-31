/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Condition } from 'app/modules/scenario/models/conditions/tv-condition';
import { EntityCondition } from '../../models/conditions/entity-condition';
import { ConditionCategory, ConditionType } from '../../models/tv-enums';

@Component( {
	selector: 'app-condition-editor',
	templateUrl: './condition-editor.component.html',
	styleUrls: [ './condition-editor.component.css' ]
} )
export class ConditionEditorComponent implements OnInit {

	@Input() condition: Condition;

	@Output() conditionChanged = new EventEmitter<Condition>();

	@Output() removed = new EventEmitter<Condition>();

	@Input() isOpen = true;

	constructor () {
	}

	get types () {
		return ConditionType;
	}

	get categories () {
		return ConditionCategory;
	}

	get conditionByEntity () {
		return this.condition as EntityCondition;
	}

	ngOnInit () {


	}

	remove () {

		this.removed.emit( this.condition );

	}

	toggle ( $event: MouseEvent ) {

		$event.preventDefault();
		$event.stopPropagation();

		this.isOpen = !this.isOpen;

	}
}
