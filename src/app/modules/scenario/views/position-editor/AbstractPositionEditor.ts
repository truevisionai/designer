/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Position } from '../../models/position';
import { ScenarioEntity } from '../../models/tv-entities';

@Component( {
	selector: 'app-abstract-position-editor',
	template: '',
} )
export abstract class AbstractPositionEditor {

	@Input() position: Position;
	@Input() entity?: ScenarioEntity;
	@Input() showType: boolean = true;
	@Output() positionChanged = new EventEmitter<Position>();
	@Output() positionModified = new EventEmitter<Position>();

}
