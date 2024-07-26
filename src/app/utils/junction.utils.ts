import { IntersectionGroup } from "app/managers/Intersection-group";
import { TvJunction } from "app/map/models/junctions/tv-junction";

export class JunctionUtils {

	static generateJunctionHash ( junction: TvJunction ) {

		const splineIds = junction.getIncomingSplines().map( spline => spline.uuid ).sort().join( ',' );

		const hash = `${ splineIds }`;

		return hash;
	}

	static generateGroupHash ( group: IntersectionGroup ) {

		const spline = group.getSplines().map( spline => spline.uuid ).sort().join( ',' );

		const hash = `${ spline }`;

		return hash;
	}

}
