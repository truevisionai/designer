/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvOrientation } from 'app/map/models/tv-common';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvVirtualJunction } from 'app/map/models/junctions/tv-virtual-junction';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Injectable } from '@angular/core';
import { AbstractFactory } from "../core/interfaces/abstract-factory";
import { Vector3 } from 'app/core/maths';
import { Asset } from 'app/assets/asset.model';
import { TvJunctionType } from 'app/map/models/junctions/tv-junction-type';
import { Log } from 'app/core/utils/log';
import { SplineIntersection } from "../services/junction/spline-intersection";
import { IntersectionGroup } from 'app/managers/Intersection-group';
import { Assert } from 'app/utils/assert';
import { AutoJunction } from "../map/models/junctions/auto-junction";
import { DefaultJunction } from "../map/models/junctions/default-junction";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionFactory extends AbstractFactory<TvJunction> {

	static createByType ( type: TvJunctionType, name: string, id: number ): TvJunction {

		let junction: TvJunction;

		switch ( type ) {

			case TvJunctionType.AUTO:
				junction = this.createAutoJunction( name, id );
				break;

			case TvJunctionType.VIRTUAL:
				Log.warn( "Virtual junctions are not supported yet" );
				junction = this.createDefaultJunction( name, id );
				break;

			case TvJunctionType.DIRECT:
				Log.warn( "Direct junctions are not supported yet" );
				junction = this.createDefaultJunction( name, id );
				break;

			default:
				junction = this.createDefaultJunction( name, id );

		}

		return junction;
	}

	static createAutoJunction ( name: string, id: number ): TvJunction {
		return new AutoJunction( name, id );
	}

	static createDefaultJunction ( name: string, id: number ): TvJunction {
		return new DefaultJunction( name, id );
	}


	static create (): DefaultJunction {
		return new DefaultJunction( 'Junction', 0 );
	}

	static createOrGetJunctionFromGroup ( group: IntersectionGroup ): TvJunction {

		const junctions = group.getJunctions();

		Assert.isTrue( junctions.length <= 1, 'Multiple junctions found in group' );

		if ( junctions.length == 0 ) {

			return JunctionFactory.createJunctionAt( group.getRepresentativePosition() );

		}

		if ( junctions.length == 1 ) {

			return junctions[ 0 ];

		}

	}

	static createJunctionAt ( position: Vector3 ): TvJunction {

		const junction = JunctionFactory.createFromType( TvJunctionType.AUTO );

		junction.centroid = position;

		return junction;

	}

	static createAutoJunctionFromGroup ( group: IntersectionGroup ): AutoJunction {

		const junction = JunctionFactory.createFromType( TvJunctionType.AUTO ) as AutoJunction;

		junction.centroid = group.getRepresentativePosition();

		junction.addSpline( group.getSplines() );

		return junction;

	}

	static createAutoJunctionFromIntersection ( intersection: SplineIntersection ): TvJunction {

		const junction = JunctionFactory.createFromType( TvJunctionType.AUTO ) as AutoJunction;

		junction.centroid = intersection.getPosition();

		junction.addSpline( intersection.spline );

		junction.addSpline( intersection.otherSpline );

		return junction;

	}

	createFromPosition ( position: Vector3 ): TvJunction {

		const junction = JunctionFactory.createFromType();

		junction.centroid = position;

		return junction;

	}

	createFromAsset ( asset: Asset, position: Vector3 ): TvJunction {

		return undefined;

	}

	static createFromType ( type: TvJunctionType = TvJunctionType.DEFAULT ): TvJunction {

		const id = TvJunction.getNextId();

		const name = `Junction${ id }`;

		if ( type == TvJunctionType.AUTO ) {

			return JunctionFactory.createAutoJunction( name, id );

		} else {

			return JunctionFactory.createDefaultJunction( name, id );

		}

	}

	static createVirtualJunction ( mainRoad: TvRoad, sStart: number, sEnd: number, orientation: TvOrientation ): TvVirtualJunction {

		const id = TvJunction.getNextId();

		const name = `VirtualJunction${ id }`;

		return new TvVirtualJunction( name, id, mainRoad, sStart, sEnd, orientation );

	}

	static createCustomJunction ( position: Vector3 ): TvJunction {

		const junction = JunctionFactory.createFromType();

		junction.centroid = position;

		return junction;
	}
}
