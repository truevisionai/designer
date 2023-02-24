/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class TvCoord {

    constructor ( x, y, z, h, p, r ) {
    }

    static getDist2d ( a: TvCoord, b: TvCoord ) {

    }

    static getDist3d ( a: TvCoord, b: TvCoord ) {

    }
}

export class TvLaneCoord {

    // total 4 properties
    // road-id
    // lane-section-id
    // s
    // lane-Id
    // lane-offset

    constructor ( public roadId: number, public sectionId: number, public laneId: number, public s: number, public offset: number ) {

    }

    init () {

    }

    addTrackCoord ( value: TvRoadCoord ) {

    }

}

export class TvRoadCoord {

    constructor ( public roadId, public s: number, public t: number = 0, public z: number = 0, public h?, public p?, public r?) {

    }

    init () {

    }

    add ( value: TvRoadCoord ) {
    }
}

export class TvGeoCoord {

    constructor ( lat, long, z, h, p, r ) {
    }
}
