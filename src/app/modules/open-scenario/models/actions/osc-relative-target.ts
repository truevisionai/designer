import { OscTargetType } from '../osc-enums';
import { AbstractTarget } from './abstract-target';

export class OscRelativeTarget extends AbstractTarget {

    public targetType = OscTargetType.relative;

    constructor ( public object: string, public target: number ) {

        super();

    }

    getTarget () {

        return this.target;

    }

    setTarget ( value ) {

        this.target = value;

    }

}