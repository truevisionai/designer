/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Asset } from 'app/core/asset/asset.model';

export interface DragDropData extends Asset {
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
