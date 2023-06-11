import { OscTargetType } from '../osc-enums';
import { AbstractTarget } from './abstract-target';

export class OscAbsoluteTarget extends AbstractTarget {

    public targetType = OscTargetType.absolute;

    private target: number;

    constructor ( target: number ) {

        super();

        this.target = target;

    }

    getTarget () {

        return this.target;

    }

    setTarget ( value ) {

        this.target = value;

    }

}