/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Target } from '../../models/actions/target';
import { AbsoluteTarget } from '../../models/actions/tv-absolute-target';
import { RelativeTarget } from '../../models/actions/tv-relative-target';
import { TargetType } from '../../models/tv-enums';

@Component( {
	selector: 'app-target-editor',
	templateUrl: './target-editor.component.html',
	styleUrls: [ './target-editor.component.css' ]
} )
export class TargetEditorComponent {

	@Input() target: Target;

	@Output() changed = new EventEmitter<Target>();

	get relativeTarget () {

		return this.target as RelativeTarget;

	}

	onEntityChanged ( $entity: string ): void {

		this.relativeTarget.entityRef.name = $entity;

	}

	onValueChanged ( $event: any ): void {

		this.target.setTarget( $event );

	}

	onTypeChanged ( $type: TargetType ): void {

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
