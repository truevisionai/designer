/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { IKeyboardShortcut } from 'app/core/interfaces/shortcuts';
import { TvShorcutFactory } from '../shortcuts/od-shortcut-factory';

@Injectable( {
    providedIn: 'root'
} )
export class OdShortcutService {

    private static mShortcuts: IKeyboardShortcut[] = [];

    constructor () {

        TvShorcutFactory.shortcuts.forEach( ( shortcut ) => {

            OdShortcutService.mShortcuts.push( new shortcut );

        } );

    }

    get shortcuts (): IKeyboardShortcut[] {

        return OdShortcutService.mShortcuts;
    }

    static get shortcuts (): IKeyboardShortcut[] {

        return OdShortcutService.mShortcuts;
    }

    public register ( shortcut: IKeyboardShortcut ) {

        OdShortcutService.mShortcuts.push( shortcut );

    }

    public static register ( shortcut: IKeyboardShortcut ): any {

        this.mShortcuts.push( shortcut );

    }

    public handleKeyDown ( e: KeyboardEvent ): any {

        this.shortcuts.forEach( ( shortcut ) => {

            if ( shortcut.check( e ) ) {

                shortcut.execute();

                return false;

            }

        } );

    }


}