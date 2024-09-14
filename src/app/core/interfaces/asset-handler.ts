import { Asset } from "../../assets/asset.model";
import { PointerEventData } from "../../events/pointer-event-data";

export interface AssetHandler {

	isAssetSupported ( asset: Asset ): boolean;

	isLocationValid ( asset: Asset, event: PointerEventData ): boolean;

	onAssetDropped ( asset: Asset, event: PointerEventData ): void;

	onAssetDragOver ( asset: Asset, event: PointerEventData ): void;

}