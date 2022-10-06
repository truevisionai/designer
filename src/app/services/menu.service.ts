/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Menu, MenuItem, MenuItemConstructorOptions } from 'electron';
import { ElectronService } from 'ngx-electron';

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

    constructor ( private electron: ElectronService ) {

    }

    registerContextMenu ( type: ContextMenuType, template: Array<( MenuItemConstructorOptions ) | ( MenuItem )> ) {

        if ( !this.electron.isElectronApp ) return;

        const menu = this.electron.remote.Menu.buildFromTemplate( template );

        this.menus.set( type, menu );
    }

    showContextMenu ( type: ContextMenuType ) {

        if ( !this.electron.isElectronApp ) return;

        if ( this.menus.has( type ) ) {

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
