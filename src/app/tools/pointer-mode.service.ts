/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ToolManager } from 'app/managers/tool-manager';
import { BehaviorSubject, Observable } from 'rxjs';

export enum PointerSelectionMode {
	Pointer = 'pointer',
	BoxSelection = 'box-selection',
}

@Injectable( {
	providedIn: 'root'
} )
export class PointerModeService {

	private readonly modeSubject = new BehaviorSubject<PointerSelectionMode>( PointerSelectionMode.Pointer );

	modeChanges: Observable<PointerSelectionMode> = this.modeSubject.asObservable();

	get currentMode (): PointerSelectionMode {
		return this.modeSubject.value;
	}

	constructor () {
		ToolManager.toolChanged.subscribe( () => this.reset() );
	}

	setMode ( mode: PointerSelectionMode ): void {

		if ( this.modeSubject.value === mode ) return;

		this.modeSubject.next( mode );

	}

	isBoxSelection (): boolean {
		return this.modeSubject.value === PointerSelectionMode.BoxSelection;
	}

	reset (): void {
		this.setMode( PointerSelectionMode.Pointer );
	}

}
