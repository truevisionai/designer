/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ClassProvider, FactoryProvider, InjectionToken } from '@angular/core';

export function _window (): any {
	return window;
}

export const WINDOW = new InjectionToken( 'WindowToken' );

export abstract class WindowRef {
	get nativeWindow (): Window {
		throw new Error( 'Not implemented.' );
	}
}

export class BrowserWindowRef extends WindowRef {
	constructor () {
		super();
	}

	get nativeWindow (): Window {
		return _window();
	}
}

const browserWindowProvider: ClassProvider = {
	provide: WindowRef,
	useClass: BrowserWindowRef
};
export const windowProvider: FactoryProvider = {
	provide: WINDOW,
	useFactory: _window,
	deps: []
};
export const WINDOW_PROVIDERS = [
	browserWindowProvider,
	windowProvider
];
