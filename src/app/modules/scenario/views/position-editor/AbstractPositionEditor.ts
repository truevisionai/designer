/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Position } from '../../models/position';

@Component( {
	selector: 'app-abstract-position-editor',
	template: '',
} )
export abstract class AbstractPositionEditor {

	@Input() position: Position;
	@Input() showType: boolean = true;
	@Input() disableType: boolean = false;
	@Output() positionChanged = new EventEmitter<Position>();
	@Output() positionModified = new EventEmitter<Position>();

}
