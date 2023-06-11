import { AbstractPosition } from '../osc-interfaces';
import { OscPositionType } from '../osc-enums';
import { OscOrientation } from '../osc-orientation';
import { Vector3 } from 'three';

export class OscRoadPosition extends AbstractPosition {

    public readonly type = OscPositionType.Road;

    private roadId: number;
    private sValue: number;
    private tValue: number;
    private orientation: OscOrientation;

    constructor ( roadId = 0, sValue = 0, tValue = 0, orientation: OscOrientation = null ) {

        super();

        this.roadId = roadId;
        this.sValue = sValue;
        this.tValue = tValue;
        this.orientation = orientation;

    }

    exportXml () {

        throw new Error( 'Method not implemented.' );

    }

    getPosition (): Vector3 {

        console.error( 'Method not implemented.' );

        return new Vector3();

    }

}