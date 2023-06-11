import { OscConditionType, OscRule } from '../osc-enums';
import { AbstractByEntityCondition } from './osc-condition';

export class OscAccelerationCondition extends AbstractByEntityCondition {

    conditionType = OscConditionType.ByEntity_Acceleration;

    constructor ( public value: number, public rule: OscRule ) {

        super();

    }

    hasPassed (): boolean {
        return false;
    }

}