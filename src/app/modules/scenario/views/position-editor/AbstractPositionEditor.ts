/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractPosition } from '../../models/abstract-position';

@Component( {
	selector: 'app-abstract-position-editor',
	template: '',
} )
export abstract class AbstractPositionEditor {

	@Input() position: AbstractPosition;
	@Input() showType: boolean = true;
	@Input() disableType: boolean = false;
	@Output() positionChanged = new EventEmitter<AbstractPosition>();
	@Output() positionModified = new EventEmitter<AbstractPosition>();

}
