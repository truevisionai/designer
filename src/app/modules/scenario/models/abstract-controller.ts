import { TvMapInstance } from '../../tv-map/services/tv-map-source-file';

export abstract class AbstractController {

	update (): void {
		console.error( 'controller update method not overridden' );
	}

	get map () {
		return TvMapInstance.map;
	}


}
