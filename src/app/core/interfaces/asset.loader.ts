/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Asset } from "../../assets/asset.model";

export interface AssetLoader {

	load ( asset: Asset ): any;

}