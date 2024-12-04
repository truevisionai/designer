/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MenuItem, MenuItemConstructorOptions } from 'electron';
import { TvElectronService } from './tv-electron.service';

export enum ContextMenuType {
	VIEWPORT = 0,
	GAME_OBJECT = 1,
	HIERARCHY = 3,
}

declare const menus;

@Injectable( {
	providedIn: 'root'
} )
export class MenuService {

	constructor ( private electron: TvElectronService ) {
	}

	registerContextMenu ( type: ContextMenuType, template: Array<( MenuItemConstructorOptions ) | ( MenuItem )> ): void {

		if ( !this.electron.isElectronApp ) return;

		menus.append( type, template );
	}

	showContextMenu ( type: ContextMenuType ): void {

		if ( !this.electron.isElectronApp ) return;

		menus.popup( type );
	}
}
