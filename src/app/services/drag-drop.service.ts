/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AssetNode } from 'app/views/editor/project-browser/file-node.model';

export interface DragDropData extends AssetNode {
}

@Injectable( {
	providedIn: 'root'
} )
export class DragDropService {

	private data: DragDropData;

	setData ( data: DragDropData ) {
		this.data = data;
	}

	getData () {
		return this.data;
	}

	clear () {
		this.data = undefined;
	}

}
