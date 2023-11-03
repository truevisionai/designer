/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';

export class KeyboardEvents {

	public static keyUp = new EventEmitter<KeyboardEvent>();
	public static keyDown = new EventEmitter<KeyboardEvent>();

	public static isShiftKeyDown: boolean;

	private static isKeyDown: boolean;
	private static keyCode: number;

	static OnKeyDown ( e: KeyboardEvent ) {

		this.isKeyDown = true;
		this.keyCode = e.keyCode;

		this.keyUp.emit( e );

		this.isShiftKeyDown = e.shiftKey;
	}

	static OnKeyUp ( e: KeyboardEvent ) {

		this.isKeyDown = false;
		this.keyCode = e.keyCode;

		this.keyDown.emit( e );

		this.isShiftKeyDown = e.shiftKey;
	}

}
