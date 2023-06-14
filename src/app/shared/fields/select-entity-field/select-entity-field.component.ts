import { Component, Input, OnInit } from '@angular/core';
import { AbstractFieldComponent } from '../../../core/components/abstract-field.component';
import { TvScenarioInstance } from '../../../modules/scenario/services/tv-scenario-instance';

@Component( {
	selector: 'app-select-entity-field',
	templateUrl: './select-entity-field.component.html',
	styleUrls: [ './select-entity-field.component.scss' ]
} )
export class SelectEntityFieldComponent extends AbstractFieldComponent implements OnInit {

	@Input() value: string;
	@Input() label: string = 'Entity';

	constructor () {
		super();
	}

	get entities () {
		return [ ...TvScenarioInstance.openScenario.objects.keys() ];
	}

	ngOnInit () {
	}

	onEntityChanged ( $entity: string ) {
		this.changed.emit( $entity );
	}
}
