/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { PointerEventData } from 'app/events/pointer-event-data';
import { PropInstance } from 'app/map/prop-point/prop-instance.object';
import { AssetDatabase } from 'app/assets/asset-database';
import { PropManager } from 'app/managers/prop-manager';
import { Object3D } from 'three';
import { BaseCreationStrategy } from 'app/core/interfaces/base-creation-strategy';
import { ValidationFailed, ValidationPassed, ValidationResult } from 'app/core/interfaces/creation-strategy';

@Injectable( {
	providedIn: 'root'
} )
export class PropInstanceCreationStrategy extends BaseCreationStrategy<PropInstance> {

	validate ( event: PointerEventData, _lastSelected?: object ): ValidationResult {

		if ( !this.hasSelectedProp() ) {
			return new ValidationFailed( 'Select a prop from the project browser' );
		}

		if ( !event.point ) {
			return new ValidationFailed( 'Unable to determine placement position' );
		}

		return new ValidationPassed();
	}

	canCreate ( event: PointerEventData, _lastSelected?: object ): boolean {

		return this.hasSelectedProp() && !!event.point;

	}

	createObject ( event: PointerEventData, _lastSelected?: object ): PropInstance {

		const selectedProp = PropManager.getProp();

		if ( !selectedProp ) return;

		const model = AssetDatabase.getInstance<Object3D>( selectedProp.guid );

		if ( !model ) return;

		const instance = new PropInstance( selectedProp.guid, model.clone() );

		instance.setPosition( event.point.clone() );

		return instance;
	}

	private hasSelectedProp (): boolean {

		return !!PropManager.getProp();

	}

}
