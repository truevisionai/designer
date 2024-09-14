import { AssetDatabase } from "app/assets/asset-database";
import { Asset, AssetType } from "app/assets/asset.model";
import { RoadStyle } from "app/assets/road-style/road-style.model";
import { Commands } from "app/commands/commands";
import { AssetHandler } from "app/core/interfaces/asset-handler";
import { PointerEventData } from "app/events/pointer-event-data";
import { TvMapQueries } from "app/map/queries/tv-map-queries";
import { RoadService } from "app/services/road/road.service";
import { Vector3 } from "three";

export class RoadStyleAssetDropHandler implements AssetHandler {

	onAssetDragOver ( asset: Asset, event: PointerEventData ): void {

		// throw new Error( "Method not implemented." );

	}

	onAssetDropped ( asset: Asset, event: PointerEventData ): void {

		this.importAsset( asset, event.point );

	}

	isLocationValid ( asset: Asset, event: PointerEventData  ): boolean {

		const coord = TvMapQueries.findRoadCoord( event.point );

		if ( !coord ) return false;

		return true;

	}

	isAssetSupported ( asset: Asset ): boolean {

		return asset.type === AssetType.ROAD_STYLE;

	}

	importAsset ( asset: Asset, position: Vector3 ): void {

		const road = RoadService.instance.findNearestRoad( position );

		if ( !road ) {
			console.warn( 'Road not found' );
			return;
		}

		const roadStyle = AssetDatabase.getInstance<RoadStyle>( asset.guid );

		if ( !roadStyle ) {
			console.warn( 'Road style not found' );
			return;
		}

		const oldValue = road.roadStyle.clone( null );

		const newValue = roadStyle.clone( null );

		Commands.SetValue( road, 'roadStyle', newValue, oldValue );

	}

}
