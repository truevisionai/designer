export enum OscParameterType {
    integer = 'integer',
    double = 'double',
    string = 'string',
}

export enum OscSex {
    male,
    female
}

export enum OscVehicleCategory {
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

export enum OscByConditionActor {
    triggeringEntity,
    anyEntity
}

export enum OscMiscObject_category {
    barrier,
    guardRail,
    other
}

export enum OscPedestrianCategory {
    pedestrian,
    wheelchair,
    animal
}

export enum OscConditionEdge {
    rising = 'rising',
    falling = 'falling',
    any = 'any'
}

export enum OscObjectType {
    pedestrian,
    vehicle,
    miscellaneous
}

export enum OscPositionType {
    World,
    RelativeWorld,
    RelativeObject,
    Road,
    RelativeRoad,
    Lane,
    RelativeLane,
    Route
}

export enum OscRule {
    greater_than = 'greater_than',
    less_than = 'less_than',
    equal_to = 'equal_to',
}

export enum OscTargetType {
    absolute = 'absolute',
    relative = 'relative'
}

export enum OscDynamicsShape {
    linear = 'linear',
    cubic = 'cubic',
    sinusoidal = 'sinusoidal',
    step = 'step',
}

export enum OscConditionCategory {
    ByEntity,
    ByState,
    ByValue
}

export enum OscTriggeringRule {
    Any = 'any',
    All = 'all'
}

export enum OscStoryElementType {
    act = 'act',
    scene = 'scene',
    maneuver = 'maneuver',
    event = 'event',
    action = 'action',
}

export enum OscAfterTerminationRule {
    end = 'end',
    cancel = 'cancel',
    any = 'any'
}

export enum OscConditionType {
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

export enum OscActionCategory {
    private = 'private',
    global = 'global',
    userDefined = 'user_defined'
}

export enum OscActionType {
    Private_Longitudinal_Speed,
    Private_Longitudinal_Distance,
    Private_Lateral,
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

export enum OscRelativeDistanceType {
    longitudinal,
    lateral,
    intertial
}

export enum OscLateralPurpose {
    position = 'position',
    steering = 'steering'
}

export enum OscController_domain {
    longitudinal,
    lateral,
    both
}

export enum OscMeeting_Position_mode {
    straight,
    route
}

export enum OscSpeed_Target_valueType {
    delta,
    factor
}

export enum OscScript_execution {
    single,
    continuous
}

export enum OscEventPriority {
    overwrite,
    following,
    skip
}

export enum OscDomainAbsoluteRelative {
    absolute = 'absolute',
    relative = 'relative'
}

export enum OscDomainTimeDistance {
    time = 'time',
    distance = 'distance'
}

export enum OscOrientationType {
    relative = 'relative',
    absolute = 'absolute'
}

export enum OscCloudState {
    skyOff,
    free,
    cloudy,
    overcast,
    rainy,
}

export enum OscPrecipitationType {
    dry,
    rain,
    snow
}

export enum OscRouteStrategy {
    fastest = 'fastest',
    shortest = 'shortest',
    leastIntersections = 'leastIntersections',
    random = 'random'

}