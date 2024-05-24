/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Asset } from "../asset/asset.model";

export interface AssetLoader {

	load ( asset: Asset ): any;

}