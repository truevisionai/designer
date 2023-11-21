/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable, EventEmitter } from '@angular/core';

@Injectable( {
	providedIn: 'root'
} )
export class EditorEvents {

	static onZoomIn = new EventEmitter<any>();
	static onZoomOut = new EventEmitter<any>();
	static onZoomReset = new EventEmitter<any>();

	static sceneRendered = new EventEmitter<number>();
	static sceneCreated = new EventEmitter<null>();

}
