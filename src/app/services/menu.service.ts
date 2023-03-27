/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Menu, MenuItem, MenuItemConstructorOptions } from 'electron';
import { TvElectronService } from './tv-electron.service';

export enum ContextMenuType {
    VIEWPORT = 0,
    GAME_OBJECT = 1,
    HIERARCHY = 3,
}

@Injectable( {
    providedIn: 'root'
} )
export class MenuService {

    private menus: Map<number, Menu> = new Map<number, Menu>();

    constructor ( private electron: TvElectronService ) {

    }

    registerContextMenu ( type: ContextMenuType, template: Array<( MenuItemConstructorOptions ) | ( MenuItem )> ) {

        if ( !this.electron.isElectronApp ) return;

		// TODO: fix
        const menu = this.electron.remote.Menu.buildFromTemplate( template );

        this.menus.set( type, menu );
    }

    showContextMenu ( type: ContextMenuType ) {

        if ( !this.electron.isElectronApp ) return;

        if ( this.menus.has( type ) ) {

			// TOOD: fix
            const menu = this.menus.get( type );

            menu.popup( {
                window: this.electron.remote.getCurrentWindow()
            } );
        }
    }

    private sampleRegister () {

        // this.menu = electron.remote.require( 'menu' );

        // const menu = electron.remote.Menu.buildFromTemplate( [ {
        //     label: 'File',
        //     click: () => {
        //         console.log( 'clicked' );
        //     }
        // } ] );

        // const menu = new Menu();
        //
        // menu.append( new MenuItem( {
        //     label: 'File',
        //     click: () => {
        //         console.log( 'clicked' );
        //     }
        // } ) );

        // this.registerContextMenu( ContextMenuType.VIEWPORT, menu );

    }
}
