import { OscSourceFile } from '../../services/osc-source-file';
import { OscConditionType, OscTriggeringRule } from '../osc-enums';
import { AbstractPosition } from '../osc-interfaces';
import { AbstractByEntityCondition } from './osc-condition';

export class OscReachPositionCondition extends AbstractByEntityCondition {

	conditionType = OscConditionType.ByEntity_ReachPosition;

	constructor ( public position?: AbstractPosition, public tolerance: number = 0 ) {
		super();
	}

	hasPassed (): boolean {

		if ( this.position == null ) throw new Error( 'Position value can not be null' );

		if ( this.passed ) return true;

		const targetPosition = this.position.getPosition();

		for ( const entityName of this.entities ) {

			const entity = OscSourceFile.openScenario.findEntityOrFail( entityName );

			const distanceFromTarget = entity.position.distanceTo( targetPosition );

			const hasReachedTarget = distanceFromTarget <= this.tolerance;

			// exit if any of the distance tolerance is passed
			if ( hasReachedTarget && this.triggeringRule === OscTriggeringRule.Any ) {

				this.passed = true;

				break;
			}

			// exit if any of the distance distance is not passed
			if ( !hasReachedTarget && this.triggeringRule === OscTriggeringRule.All ) {

				this.passed = false;

				break;

			}

		}

	}

}
