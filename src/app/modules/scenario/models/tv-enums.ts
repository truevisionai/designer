/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export enum ParameterType {
	integer = 'integer',
	double = 'double',
	string = 'string',
}

export enum Sex {
	male,
	female
}

export enum VehicleCategory {
	car,
	van,
	truck,
	trailer,
	semitrailer,
	bus,
	motorbike,
	bicycle,
	train,
	tram,
}

export enum ByConditionActor {
	triggeringEntity,
	anyEntity
}

export enum MiscObject_category {
	barrier,
	guardRail,
	other
}

export enum PedestrianCategory {
	pedestrian,
	wheelchair,
	animal
}

export enum ConditionEdge {
	rising = 'rising',
	falling = 'falling',
	any = 'any'
}

export enum ObjectType {
	pedestrian,
	vehicle,
	miscellaneous
}

export enum PositionType {
	World,
	RelativeWorld,
	RelativeObject,
	Road,
	RelativeRoad,
	Lane,
	RelativeLane,
	Route
}

export enum Rule {
	greater_than = 'greater_than',
	less_than = 'less_than',
	equal_to = 'equal_to',
}

export enum TargetType {
	absolute = 'absolute',
	relative = 'relative'
}

export enum DynamicsShape {
	linear = 'linear',
	cubic = 'cubic',
	sinusoidal = 'sinusoidal',
	step = 'step',
}

export enum ConditionCategory {
	ByEntity,
	ByState,
	ByValue
}

export enum TriggeringRule {
	Any = 'any',
	All = 'all'
}

export enum StoryElementType {
	act = 'act',
	scene = 'scene',
	maneuver = 'maneuver',
	event = 'event',
	action = 'action',
}

export enum AfterTerminationRule {
	end = 'end',
	cancel = 'cancel',
	any = 'any'
}

export enum ConditionType {
	ByEntity_EndOfRoad = 0,
	ByEntity_Collision = 1,
	ByEntity_Offroad = 2,
	ByEntity_TimeHeadway = 3,
	ByEntity_TimeToCollision = 4,
	ByEntity_Acceleration = 5,
	ByEntity_StandStill = 6,
	ByEntity_Speed = 7,
	ByEntity_RelativeSpeed = 8,
	ByEntity_TraveledDistance = 9,
	ByEntity_ReachPosition = 10,
	ByEntity_Distance = 11,
	ByEntity_RelativeDistance = 12,

	ByState_AfterTermination = 13,
	ByState_AtStart = 14,
	ByState_Command = 15,
	ByState_Signal = 16,
	ByState_Controller = 17,

	ByValue_Parameter = 18,
	ByValue_TimeOfDay = 19,
	ByValue_SimulationTime = 20
}

export enum ActionCategory {
	private = 'private',
	global = 'global',
	userDefined = 'user_defined'
}

export enum ActionType {
	Private_Longitudinal_Speed,
	Private_Longitudinal_Distance,
	Private_LaneChange,
	Private_LaneOffset,
	Private_Visbility,
	Private_Meeting,
	Private_Autonomous,
	Private_Controller,
	Private_Position,
	Private_Routing,

	UserDefined_Command,
	UserDefined_Script,

	Global_SetEnvironment,
	Global_Entity,
	Global_Parameter,
	Global_Infrastructure,
	Global_Traffic
}

export enum EnumOrientationType {
	relative = 'relative',
	absolute = 'absolute'
}

export enum RelativeDistanceType {
	longitudinal,
	lateral,
	intertial
}

export enum LateralPurpose {
	position = 'position',
	steering = 'steering'
}

export enum Controller_domain {
	longitudinal,
	lateral,
	both
}

export enum Meeting_Position_mode {
	straight,
	route
}

export enum Speed_Target_valueType {
	delta,
	factor
}

export enum Script_execution {
	single,
	continuous
}

export enum EventPriority {
	overwrite,
	following,
	skip
}

export enum DomainAbsoluteRelative {
	absolute = 'absolute',
	relative = 'relative'
}

export enum DomainTimeDistance {
	time = 'time',
	distance = 'distance'
}

export enum OrientationType {
	relative = 'relative',
	absolute = 'absolute'
}

export enum CloudState {
	skyOff,
	free,
	cloudy,
	overcast,
	rainy,
}

export enum PrecipitationType {
	dry,
	rain,
	snow
}

export enum RouteStrategy {
	fastest = 'fastest',
	shortest = 'shortest',
	leastIntersections = 'leastIntersections',
	random = 'random'

}
