/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvElectronService } from 'app/services/tv-electron.service';

export class AppInfo {

    static electron: TvElectronService;

    static get isElectronApp (): boolean {

        return this.electron.isElectronApp;

    }
}
