import { Log } from "app/core/utils/log";
import { OdTextures } from "app/deprecated/od.textures";
import { TvRoadObject } from "app/map/models/objects/tv-road-object";
import { TvRoad } from "app/map/models/tv-road.model";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { RoadWidthService } from "app/services/road/road-width.service";
import { Maths } from "app/utils/maths";
import { COLOR } from "app/views/shared/utils/colors.service";
import { BufferAttribute, BufferGeometry, PointsMaterial } from "three";

export class PointMarkingControlPoint extends AbstractControlPoint {

	public static readonly TAG = 'PointMarkingControlPoint';

	public readonly roadObject: TvRoadObject;

	public readonly road: TvRoad;

	constructor ( road: TvRoad, roadObject: TvRoadObject, geometry?: BufferGeometry, material?: PointsMaterial ) {

		super( geometry, material );

		this.road = road;

		this.roadObject = roadObject;

		this.tag = PointMarkingControlPoint.TAG;

	}

	get s (): number {

		return this.roadObject.s;

	}

	set s ( s: number ) {

		try {

			this.roadObject.s = Maths.clamp( s, 0, this.road.length );

			const posTheta = this.road.getPosThetaAt( this.roadObject.s, this.roadObject.t );

			this.setPosition( posTheta.position );

		} catch ( error ) {

			Log.error( error );

		}

	}

	get t (): number {

		return this.roadObject.t;

	}

	set t ( t: number ) {

		try {

			const roadWidth = RoadWidthService.instance.findRoadWidthAt( this.road, this.roadObject.s );

			this.roadObject.t = Maths.clamp( t, -roadWidth.leftSideWidth, roadWidth.rightSideWidth );

			const posTheta = this.road.getPosThetaAt( this.roadObject.s, this.roadObject.t );

			this.setPosition( posTheta.position );

		} catch ( error ) {

			Log.error( error );

		}

	}

	static create ( road: TvRoad, roadObject: TvRoadObject ): PointMarkingControlPoint {

		const geometry = new BufferGeometry();

		geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( 3 ), 3 ) );

		const texture = OdTextures.point;

		const material = new PointsMaterial( {
			size: 10,
			sizeAttenuation: false,
			map: texture,
			alphaTest: 0.5,
			transparent: true,
			color: COLOR.CYAN,
			depthTest: false
		} );

		return new PointMarkingControlPoint( road, roadObject, geometry, material );
	}

}
