import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractPosition } from '../../../models/osc-interfaces';

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
