/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IFile } from '../../io/file';
import { TvMap } from '../models/tv-map.model';

export class TvMapInstance {

	static currentFile: IFile;

	private static _map: TvMap;

	static get map (): TvMap {
		return this._map;
	}

	static set map ( value: TvMap ) {
		this._map = value;
	}
}
