import { Injectable } from "@angular/core";
import { INode } from "app/objects/i-selectable";
import { BaseVisualizer } from "./base-visualizer";

@Injectable( {
	providedIn: 'root'
} )
export class NodeVisualizer<T extends INode> extends BaseVisualizer<T> {

	onHighlight ( object: T ): void {
		object.onMouseOver();
	}

	onSelected ( object: T ): void {
		object.select();
	}

	onDefault ( object: T ): void {
		object.onMouseOut();
	}

	onUnselected ( object: T ): void {
		object.unselect();
	}

	onAdded ( object: T ): void {
		//
	}

	onUpdated ( object: T ): void {
		//
	}

	onRemoved ( object: T ): void {
		object.unselect();
	}

	onClearHighlight (): void {
		//
	}

	clear (): void {
		//
	}

}
