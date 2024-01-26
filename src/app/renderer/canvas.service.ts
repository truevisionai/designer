/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';

@Injectable( {
	providedIn: 'root'
} )
export class CanvasService {

	public width: number = 600;

	public height: number = 600;

	public left: number = 0;

	public top: number = 0;

	public resized = new EventEmitter<any>();

	get aspect (): number {
		return this.width / this.height;
	}

	constructor () {
	}

	resizeViewport ( container: HTMLElement ): void {

		const box = container.getBoundingClientRect();

		this.width = container.clientWidth;
		this.height = container.clientHeight;

		this.left = box.left;
		this.top = box.top;

		this.resized.emit();

	}
}
