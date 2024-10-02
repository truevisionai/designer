import { TvJunction } from "./junctions/tv-junction";
import { TvContactPoint } from "./tv-common";
import { TvLinkType, TvLink, TvRoadLink, TvJunctionLink } from "./tv-link";
import { TvRoad } from "./tv-road.model";

export abstract class LinkFactory {

	static createLink ( type: TvLinkType, element: TvRoad | TvJunction, contact?: TvContactPoint ): TvLink {

		if ( type == TvLinkType.ROAD ) {

			return this.createRoadLink( element as TvRoad, contact );

		} else {

			return this.createJunctionLink( element as TvJunction );

		}

	}

	static createRoadLink ( road: TvRoad, contact: TvContactPoint ): TvLink {

		return new TvRoadLink( road, contact );

	}

	static createJunctionLink ( junction: TvJunction ): TvLink {

		return new TvJunctionLink( junction );

	}


}
