import { PointerEventData } from "app/events/pointer-event-data";
import { CreationStrategy, ValidationResult } from "./creation-strategy";

export abstract class BaseCreationStrategy<T> implements CreationStrategy<T> {

	abstract validate ( event: PointerEventData, lastSelected?: any ): ValidationResult;

	abstract createObject ( event: PointerEventData, lastSelected?: any ): T;

	canCreate ( event: PointerEventData, lastSelected?: any ): boolean {

		return true;

	}

}
