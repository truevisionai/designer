import { OscConditionType, OscRule, OscTriggeringRule } from '../osc-enums';
import { AbstractByEntityCondition } from './osc-condition';
import { OscSourceFile } from '../../services/osc-source-file';
import { OscUtils } from '../osc-utils';

export class OscSpeedCondition extends AbstractByEntityCondition {

    conditionType = OscConditionType.ByEntity_Speed;

    constructor ( public value: number, public rule: OscRule ) {

        super();

    }

    hasPassed (): boolean {

        if ( this.passed ) {

            return true;

        } else {

            for ( const entityName of this.entities ) {

                const entity = OscSourceFile.openScenario.findEntityOrFail( entityName );

                const passed = OscUtils.hasRulePassed( this.rule, entity.speed, this.value );

                // exit if any of the entity distance is passed
                if ( passed && this.triggeringRule === OscTriggeringRule.Any ) {

                    this.passed = true;

                    break;
                }

                // exit if any of the entity distance is not passed
                if ( !passed && this.triggeringRule === OscTriggeringRule.All ) {

                    this.passed = false;

                    break;

                }

            }

            return this.passed;

        }

    }

}