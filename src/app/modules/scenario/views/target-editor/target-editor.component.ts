/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Target } from '../../models/actions/target';
import { AbsoluteTarget } from '../../models/actions/tv-absolute-target';
import { RelativeTarget } from '../../models/actions/tv-relative-target';
import { TargetType } from '../../models/tv-enums';
import { TvScenarioInstance } from '../../services/tv-scenario-instance';

@Component( {
	selector: 'app-target-editor',
	templateUrl: './target-editor.component.html',
	styleUrls: [ './target-editor.component.css' ]
} )
export class TargetEditorComponent implements OnInit {

	@Input() target: Target;

	@Output() changed = new EventEmitter<Target>();

	targetTypes = TargetType;

	constructor () {

	}

	ngOnInit (): void {


	}

	get entities () {

		return [ ...TvScenarioInstance.openScenario.objects.keys() ];

	}

	get relativeTarget () {

		return this.target as RelativeTarget;

	}

	get absoluteTarget () {

		return this.target as AbsoluteTarget;

	}

	onAbsoluteTargetChanged ( value: any ) {

		this.absoluteTarget.setTarget( value );

	}

	onRelativeTargetChanged ( value: any ) {

		this.relativeTarget.setTarget( value );

	}

	onEntityChanged( $entity: string ) {

		this.relativeTarget.entityName = $entity;

	}

	onValueChanged ( $event: any ) {

		this.target.setTarget( $event );

	}

	onTypeChanged ( $type: TargetType ) {

		switch ( $type ) {

			case TargetType.absolute:
				this.target = new AbsoluteTarget( this.target.value );
				break;

			case TargetType.relative:
				this.target = new RelativeTarget( null, this.target.value );
				break;

		}

		this.changed.emit( this.target );

	}
}
