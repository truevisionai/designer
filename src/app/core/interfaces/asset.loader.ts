import { Asset } from "../asset/asset.model";

export interface AssetLoader {

	load ( asset: Asset ): any;

}