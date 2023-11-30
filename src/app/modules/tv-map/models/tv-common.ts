/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvConsole } from '../../../core/utils/console';
import { DynamicsDimension, DynamicsShape } from '../../scenario/models/tv-enums';

export class TvUserData {
	constructor ( public attr_code: string, public attr_value ) {
	}
}

export enum TvElementType {
	road = 'road',
	junction = 'junction'
}

export enum TvLaneType {
	none = 'none', // Describes the space on the outermost edge of the road and
	// does not have actual content Its only purpose is for applications to
	// register that ASAM OpenDRIVE is still present in case the (human) driver leaves the road.
	driving = 'driving', // Describes a "normal" drivable road that is not one of the other types.
	stop = 'stop', // Hard shoulder on motorways for emergency stops
	shoulder = 'shoulder', // Describes a soft border at the edge of the road.
	biking = 'biking', // Describes a lane that is reserved for cyclists.
	sidewalk = 'sidewalk', // Describes a lane on which pedestrians can walk.
	border = 'border', // Describes a hard border at the edge of the road. It has the same height as the drivable lane.
	restricted = 'restricted', // Describes a lane on which cars should not drive. The lane has the same height as
	// drivable lanes. Typically, the lane is separated with lines and often contains dotted lines as well.
	parking = 'parking', // Describes a lane with parking spaces.
	bidirectional = 'bidirectional', // (this lane type has two use cases:
	// a) only driving lane on a narrow road which may be used in both directions;
	// b) continuous two-way left turn lane on multi-lane roads – US road networks)
	median = 'median', // Describes a lane that sits between driving lanes that lead in opposite directions.
	// It is typically used to separate traffic in towns on large roads.
	special1 = 'special1',
	special2 = 'special2',
	special3 = 'special3',
	roadWorks = 'roadWorks',
	tram = 'tram',
	rail = 'rail',
	entry = 'entry', // Describes a lane type that is used for sections that are parallel to the main road. It is mainly used for acceleration lanes.
	exit = 'exit', // Describes a lane that is used for sections that are parallel to the main road. It is mainly used for deceleration lanes.
	offRamp = 'offRamp', // A ramp leading away from a motorway and onto rural urban roads.
	onRamp = 'onRamp', // A ramp leading to a motorway from rural or urban roads.
	connectingRamp = 'connectingRamp', // A ramp that connects two motorways, for example, motorway junctions.
	bux = 'bux',
	taxi = 'taxi',
	HOV = 'HOV',
	curb = 'curb', // Describes curb stones. Curb stones have a different height than the adjacent drivable lanes.
}

export enum TvRoadMarkTypes {
	NONE = 'none',
	SOLID = 'solid',
	BROKEN = 'broken',
	SOLID_SOLID = 'solid solid',
	SOLID_BROKEN = 'solid broken',
	BROKEN_SOLID = 'broken solid',
	BROKEN_BROKEN = 'broken broken',
	BOTTS_DOTS = 'botts dots',
	GRASS = 'grass',
	CURB = 'curb',
}

export enum TvRoadMarkWeights {
	STANDARD = 'standard',
	BOLD = 'bold'
}

export enum TvColors {
	STANDARD = 'standard',
	BLUE = 'blue',
	GREEN = 'green',
	RED = 'red',
	WHITE = 'white',
	YELLOW = 'yellow',
	ORANGE = 'orange',
}

export enum TvParkingSpaceAccess {
	ALL = 'all',
	CAR = 'car',
	WOMEN = 'women',
	HANDICAPPED = 'handicapped',
	BUS = 'bus',
	TRUCK = 'truck',
	ELECTRIC = 'electric',
	RESIDENTS = 'residents'
}

export enum TvParkingSpaceMarkingSides {
	FRONT = 'front',
	REAR = 'rear',
	LEFT = 'left',
	RIGHT = 'right',
}

export enum TvBridgeTypes {
	CONCRETE = 'concrete',
	STEEL = 'steel',
	BRICK = 'brick',
	WOOD = 'wood',
}

export enum TvTunnelTypes {
	STANDARD = 'standard',
	UNDERPASS = 'underpass'
}

export enum TvOrientation {
	PLUS = '+',
	MINUS = '-',
	NONE = 'none'
}

export enum TvUnit {
	METER = 'm',
	KM = 'km',
	FEET = 'ft',
	MILE = 'mile',
	METER_PER_SECOND = 'm/s',
	MILES_PER_HOUR = 'mph',
	KM_PER_HOUR = 'km/h',
	KG = 'kg',
	T = 't',
	PERCENT = '%',
	NONE = 'none'
}

export enum TvDirection {
	SAME = 'same',
	OPPOSITE = 'opposite'
}

export enum TravelDirection {
	forward = 'forward',
	backward = 'backward',
	bidirectional = 'bidirectional',
	undirected = 'undirected'
}


export enum TvRoadType {
	UNKNOWN = 'unknown',
	RURAL = 'rural',
	MOTORWAY = 'motorway',
	TOWN = 'town',
	LOW_SPEED = 'lowSpeed',
	PEDESTRIAN = 'pedestrian',
	BICYCLE = 'bicycle',
}

export enum TvSide {
	LEFT = 'left',
	RIGHT = 'right',
	FRONT = 'front',
	REAR = 'rear',
	ON_LINE = 'neither', // when points is not left/right of line but on line
}

export enum TvContactPoint {
	START = 'start',
	END = 'end'
}

export enum TvStationTypes {
	SMALL = 'small',
	MEDIUM = 'medium',
	LARGE = 'large'
}

export enum TvJunctionGroupTypes {
	ROUNDABOUT = 'roundabout',
	UNKNOWN = 'unknown'
}

export enum TvDynamicTypes {
	YES = 'yes',
	NO = 'no'
}

export enum TvActionMode {
	SELECT,
	DROP,
	EDIT
}

export enum TvEditingMode {
	ANY,
	ROAD,
	LANE,
	ROADMARK,
	SIGNAL,
	OBJECT,
}

export enum TvGeometryType {
	LINE = 1,
	ARC = 2,
	SPIRAL = 3,
	POLY3 = 4,
	PARAMPOLY3 = 5,
	SPLINE = 6,
}

export enum TvLaneSide {
	LEFT,
	CENTER,
	RIGHT
}

export enum ObjectTypes {
	ROAD = 'ROAD',
	LANE = 'LANE',
	LANE_MARKING = 'LANE_MARKING',
	VEHICLE = 'vehicle',
	barrier = 'barrier',
	bike = 'bike',
	building = 'building',
	bus = 'bus',
	car = 'car',
	crosswalk = 'crosswalk',
	gantry = 'gantry',
	motorbike = 'motorbike',
	none = 'none',
	obstacle = 'obstacle',
	parkingSpace = 'parkingSpace',
	patch = 'patch',
	pedestrian = 'pedestrian',
	pole = 'pole',
	railing = 'railing',
	roadMark = 'roadMark',
	soundBarrier = 'soundBarrier',
	streetLamp = 'streetLamp',
	trafficIsland = 'trafficIsland',
	trailer = 'trailer',
	train = 'train',
	tram = 'tram',
	tree = 'tree',
	van = 'van',
	vegetation = 'vegetation',
	wind = 'wind',
}

export enum ObjectFillType {
	grass = 'grass',
	concrete = 'concrete',
	cobble = 'cobble',
	asphalt = 'asphalt',
	pavement = 'pavement',
	gravel = 'gravel',
	soil = 'soil',
	none = 'none',
}

export class EnumHelper {

	static stringToOdUnits ( value ): TvUnit {

		switch ( value ) {

			case 'm':
				return TvUnit.METER;
				break;

			case 'km':
				return TvUnit.KM;
				break;

			case 'ft':
				return TvUnit.FEET;
				break;

			case 'mile':
				return TvUnit.MILE;
				break;

			case 'm/s':
				return TvUnit.METER_PER_SECOND;
				break;

			case 'mph':
				return TvUnit.MILES_PER_HOUR;
				break;

			case 'km/h':
				return TvUnit.KM_PER_HOUR;
				break;

			case 'kg':
				return TvUnit.KG;
				break;

			case 't':
				return TvUnit.T;
				break;

			case '%':
				return TvUnit.PERCENT;
				break;

			default:
				console.error( 'unknown unit', value );
				break;
		}
	}

	static stringToDimension ( value: string ): DynamicsDimension {

		switch ( value ) {

			case 'time':
				return DynamicsDimension.time;

			case 'distance':
				return DynamicsDimension.distance;

			case 'rate':
				return DynamicsDimension.rate;

			default:
				TvConsole.warn( 'unknown dimension' + value );
				return DynamicsDimension.time;

		}

	}

	static dimensionToString ( dynamicsDimension: DynamicsDimension ) {

		switch ( dynamicsDimension ) {

			case DynamicsDimension.distance:
				return 'distance';

			case DynamicsDimension.time:
				return 'time';

			case DynamicsDimension.rate:
				return 'rate';

			default:
				TvConsole.warn( 'unknown dynamics dimension' + dynamicsDimension );
				return 'value';

		}

	}

	static stringToDynamics ( dynamicsString: string ) {

		switch ( dynamicsString ) {

			case 'step':
				return DynamicsShape.step;

			case 'linear':
				return DynamicsShape.linear;

			case 'sinusoidal':
				return DynamicsShape.sinusoidal;

			case 'cubic':
				return DynamicsShape.cubic;

			default:
				TvConsole.warn( 'unknown dynamics shape' + dynamicsString );
				return DynamicsShape.step;

		}

	}

}
