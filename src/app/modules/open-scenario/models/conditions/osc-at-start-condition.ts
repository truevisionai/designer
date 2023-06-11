import { AbstractByStateCondition } from './osc-condition';
import { OscConditionType, OscStoryElementType } from '../osc-enums';

export class OscAtStartCondition extends AbstractByStateCondition {

    public readonly conditionType = OscConditionType.ByState_AtStart;

    constructor ( public elementName: string, public type: OscStoryElementType ) {

        super();

    }

    hasPassed (): boolean {
        return false;
    }

}