import { OscConditionCategory, OscConditionType, OscRule } from '../osc-enums';
import { AbstractByValueCondition } from './osc-condition';
import { Time } from '../../../../core/time';

export class OscSimulationTimeCondition extends AbstractByValueCondition {

    public category: OscConditionCategory = OscConditionCategory.ByValue;
    public readonly conditionType = OscConditionType.ByValue_SimulationTime;

    constructor ( public value: number = null, public rule: OscRule = null ) {
        super();
    }

    hasPassed (): boolean {

        if ( this.passed ) {

            return true;

        } else {

            return this.passed = this.hasRulePassed( this.rule, Time.inSeconds, this.value );

        }
    }
}
