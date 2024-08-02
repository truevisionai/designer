/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';

declare const window: any;
declare const electronFs: any;
declare const command: any;

@Injectable( { providedIn: 'root' } )
export class TvElectronService {

	static get isElectronApp (): boolean {
		return !!window.navigator.userAgent.match( /Electron/ );
	}

	constructor () {
		if ( this.isElectronApp ) {
			this._electron = window.require( 'electron' );
			this._remote = electronFs.remote();
		}
	}

	private _electron: typeof window.electron;

	get electron (): typeof window.electron {
		return this._electron;
	}

	private _remote: any;

	get remote (): any {
		return this._remote;
	}

	get isElectronApp (): boolean {
		return !!window.navigator.userAgent.match( /Electron/ );
	}

	get isMacOS (): boolean {
		return this.isElectronApp && process.platform === 'darwin';
	}

	get isWindows (): boolean {
		return this.isElectronApp && process.platform === 'win32';
	}

	get isLinux (): boolean {
		return this.isElectronApp && process.platform === 'linux';
	}

	get isX86 (): boolean {
		return this.isElectronApp && process.arch === 'ia32';
	}

	get isX64 (): boolean {
		return this.isElectronApp && process.arch === 'x64';
	}

	get isArm (): boolean {
		return this.isElectronApp && process.arch === 'arm';
	}

	get desktopCapturer (): Electron.DesktopCapturer {
		return this.electron ? this.electron.desktopCapturer : null;
	}

	get ipcRenderer (): Electron.IpcRenderer {
		return this.electron ? this.electron.ipcRenderer : null;
	}

	get webFrame (): Electron.WebFrame {
		return this.electron ? this.electron.webFrame : null;
	}

	get clipboard (): Electron.Clipboard {
		return this.electron ? this.electron.clipboard : null;
	}

	get crashReporter (): Electron.CrashReporter {
		return this.electron ? this.electron.crashReporter : null;
	}

	get process (): any {
		return this.electron ? this.electron.remote.process : null;
	}

	get nativeImage (): typeof Electron.nativeImage {
		return this.electron ? this.electron.nativeImage : null;
	}

	get screen (): Electron.Screen {
		return this.electron ? this.electron.remote.screen : null;
	}

	get shell (): Electron.Shell {
		return this.electron ? this.electron.shell : null;
	}

	setTitle ( title: string, filePath?: string ) {

		let newTitle = title;

		if ( filePath ) newTitle += ` - ${ filePath }`;

		electronFs.setTitle( newTitle );
	}

	openLink ( link: string ) {

		this.remote.shell.openExternal( link );

	}

	/**
	 * @param exec
	 * @param args
	 * @param out
	 * @param err
	 * @param close
	 * @returns
	 */
	spawn ( exec: string, args: string[], out: Function, err: Function, close: Function ): any {

		return command.spawn( exec, args, out, err, close );

	}


}
