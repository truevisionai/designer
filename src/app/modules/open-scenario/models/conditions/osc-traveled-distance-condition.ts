import { OscConditionType, OscTriggeringRule } from '../osc-enums';
import { AbstractByEntityCondition } from './osc-condition';
import { OscSourceFile } from '../../services/osc-source-file';


export class OscTraveledDistanceCondition extends AbstractByEntityCondition {

    conditionType = OscConditionType.ByEntity_TraveledDistance;

    constructor ( public value: number ) {
        super();
    }

    hasPassed (): boolean {

        if ( this.passed ) {

            return true;

        } else {

            for ( const entityName of this.entities ) {

                const entity = OscSourceFile.openScenario.findEntityOrFail( entityName );

                const passed = entity.distanceTravelled >= this.value;

                if ( passed && this.triggeringRule === OscTriggeringRule.Any ) {

                    this.passed = true;

                    break;
                }

                if ( !passed && this.triggeringRule === OscTriggeringRule.All ) {

                    this.passed = false;

                    break;

                }

            }

            return this.passed;

        }
    }

}