import { Injectable } from "@angular/core";
import { BaseVisualizer } from "./base-visualizer";

@Injectable( {
	providedIn: 'root'
} )
export class EmptyVisualizer<T> extends BaseVisualizer<T> {

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
		// this.highlighted.forEach( object => this.onRemoved( object ) );
	}

	clear (): void {
		this.highlighted.clear();
	}

}
