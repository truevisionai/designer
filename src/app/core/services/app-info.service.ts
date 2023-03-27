/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ElectronService } from 'ngx-electron';

export class AppInfo {

	static electron: ElectronService;

	static get isElectronApp (): boolean {

		return this.electron.isElectronApp;

	}
}
