import { Injectable } from "@angular/core";
import { BaseOverlayHandler } from "./base-overlay-handler";

@Injectable( {
	providedIn: 'root'
} )
export class EmptyOverlayHandler<T> extends BaseOverlayHandler<T> {

	onHighlight ( object: T ): void {
		//
	}

	onSelected ( object: T ): void {
		//
	}

	onDefault ( object: T ): void {
		//
	}

	onUnselected ( object: T ): void {
		//
	}

	onAdded ( object: T ): void {
		//
	}

	onUpdated ( object: T ): void {
		//
	}

	onRemoved ( object: T ): void {
		//
	}

	onClearHighlight (): void {
		//
	}

	clear (): void {
		//
	}

}
