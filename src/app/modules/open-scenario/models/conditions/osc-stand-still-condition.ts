import { OscConditionType } from '../osc-enums';
import { AbstractByEntityCondition } from './osc-condition';

export class OscStandStillCondition extends AbstractByEntityCondition {

    conditionType = OscConditionType.ByEntity_StandStill;

    constructor ( public duration: number ) {
        super();
    }

    hasPassed (): boolean {
        return false;
    }

}