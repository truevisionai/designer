/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';

export interface DragDropData {
	path: string;
	extension: string;
	guid?: string;
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
