import { OscConditionType } from '../osc-enums';
import { AbstractByEntityCondition } from './osc-condition';

export class OscOffRoadCondition extends AbstractByEntityCondition {

    conditionType = OscConditionType.ByEntity_Offroad;

    constructor ( public duration: number ) {
        super();
    }

    hasPassed (): boolean {
        return false;
    }

}