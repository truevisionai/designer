import { Component, Input } from '@angular/core';
import { Position } from 'app/modules/scenario/models/position';
import { AbstractPositionEditor } from '../../position-editor/AbstractPositionEditor';

@Component( {
	selector: 'app-relative-road-position',
	templateUrl: './relative-road-position.component.html'
} )
export class RelativeRoadPositionComponent extends AbstractPositionEditor {

	@Input() position: Position;

	constructor () {
		super();
	}

}
