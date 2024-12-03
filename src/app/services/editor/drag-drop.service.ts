/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Asset } from 'app/assets/asset.model';

export interface DragDropData extends Asset {
}

@Injectable( {
	providedIn: 'root'
} )
export class DragDropService {

	private data: DragDropData;

	setData ( data: DragDropData ): void {
		this.data = data;
	}

	getData (): DragDropData {
		return this.data;
	}

	clear (): void {
		this.data = undefined;
	}

}
