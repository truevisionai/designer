import { AbstractPosition } from '../osc-interfaces';
import { OscPositionType } from '../osc-enums';
import { Vector3 } from 'three';

export class OscWorldPosition extends AbstractPosition {

    public readonly type = OscPositionType.World;

    public m_X: number = 0;
    public m_Y: number = 0;
    public m_Z: number = 0;
    public m_H: number = 0;
    public m_P: number = 0;
    public m_R: number = 0;

    get x () {
        return this.m_X;
    }

    get y () {
        return this.m_Y;
    }

    get z () {
        return this.m_Z;
    }

    get h () {
        return this.m_H;
    }

    get p () {
        return this.m_P;
    }

    get r () {
        return this.m_R;
    }

    set x ( value ) {
        this.m_X = value;
    }

    set y ( value ) {
        this.m_Y = value;
    }

    set z ( value ) {
        this.m_Z = value;
    }

    set h ( value ) {
        this.m_H = value;
    }

    set p ( value ) {
        this.m_P = value;
    }

    set r ( value ) {
        this.m_R = value;
    }

    constructor ( x = 0, y = 0, z = 0, h = 0, p = 0, r = 0 ) {

        super();

        this.m_X = x;
        this.m_Y = y;
        this.m_Z = z;

        this.m_H = h;
        this.m_P = p;
        this.m_R = r;

    }

    get position (): Vector3 {

        return new Vector3( this.m_X, this.m_Y, this.m_Z );

    }

    getPosition (): Vector3 {

        return this.position;

    }

    setPosition ( point: Vector3 ) {

        this.x = this.vector3.x = point.x;
        this.y = this.vector3.y = point.y;
        this.z = this.vector3.z = point.z;

    }

    static createFromVector3 ( point: THREE.Vector3 ): OscWorldPosition {

        const worldPosition = new OscWorldPosition();

        worldPosition.vector3 = point;

        return worldPosition;
    }

    updateVector3 () {

        this.vector3.x = this.x;
        this.vector3.y = this.y;
        this.vector3.z = this.z;

    }
}
