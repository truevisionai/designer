/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export interface ITvObject {

    OpenDriveType: TvObjectType;

    getType (): TvObjectType;
}

export enum TvObjectType {
    ROAD = 1,
    LANE = 2,
    ROADMARK = 3,
    SIGNAL = 4,
    OBJECT = 5,
    VEHICLE = 6,
}
