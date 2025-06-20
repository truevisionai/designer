/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from "app/events/pointer-event-data";
import { CreationStrategy, ValidationPassed, ValidationResult } from "./creation-strategy";

export abstract class BaseCreationStrategy<T> implements CreationStrategy<T> {

	abstract validate ( event: PointerEventData, lastSelected?: any ): ValidationResult;

	abstract createObject ( event: PointerEventData, lastSelected?: any ): T;

	canCreate ( event: PointerEventData, lastSelected?: any ): boolean {

		return true;

	}

}

export abstract class FreeValidationCreationStrategy<T> implements CreationStrategy<T> {

	validate ( event: PointerEventData, lastSelected?: any ): ValidationResult {

		return new ValidationPassed();

	}

	abstract createObject ( event: PointerEventData, lastSelected?: any ): T;

	abstract canCreate ( event: PointerEventData, lastSelected?: any ): boolean;

}
