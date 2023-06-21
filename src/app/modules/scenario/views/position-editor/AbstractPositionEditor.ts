/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Position } from '../../models/position';
import { EntityObject } from '../../models/tv-entities';

@Component( {
	selector: 'app-abstract-position-editor',
	template: '',
} )
export abstract class AbstractPositionEditor {

	@Input() position: Position;
	@Input() entity?: EntityObject;
	@Input() showType: boolean = true;
	@Input() disableType: boolean = false;
	@Output() positionChanged = new EventEmitter<Position>();
	@Output() positionModified = new EventEmitter<Position>();

}
