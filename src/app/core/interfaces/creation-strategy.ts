/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from "app/events/pointer-event-data";

export class ValidationResult {
	constructor ( public passed: boolean, public message?: string ) { }
}

export class ValidationFailed extends ValidationResult {
	constructor ( public message: string ) {
		super( false, message );
	}
}

export class ValidationPassed extends ValidationResult {
	constructor () {
		super( true );
	}
}

export interface CreationStrategy<T> {

	validate ( event: PointerEventData ): ValidationResult;

	createObject ( event: PointerEventData ): T;

}
