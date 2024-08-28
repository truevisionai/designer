import { Injectable } from "@angular/core";
import { INode } from "app/objects/i-selectable";
import { BaseOverlayHandler } from "./base-overlay-handler";

@Injectable( {
	providedIn: 'root'
} )
export class NodeOverlayHandler<T extends INode> extends BaseOverlayHandler<T> {

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
