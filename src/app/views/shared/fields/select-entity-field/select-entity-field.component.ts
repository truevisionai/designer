/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { AbstractFieldComponent } from '../abstract-field.component';
import { EntityService } from "../../../../scenario/entity/entity.service";

@Component( {
	selector: 'app-select-entity-field',
	templateUrl: './select-entity-field.component.html',
	styleUrls: [ './select-entity-field.component.scss' ]
} )
export class SelectEntityFieldComponent extends AbstractFieldComponent<string> implements OnInit {

	@Input() value: string;

	@Input() label: string = 'Entity';

	constructor ( private entityService: EntityService ) {
		super();
	}

	get entities () {
		return this.entityService.entities.map( entity => entity.name );
	}

	ngOnInit (): void {
	}

	onEntityChanged ( $entity: string ): void {
		this.changed.emit( $entity );
	}
}
