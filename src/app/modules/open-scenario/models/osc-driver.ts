/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractController } from './osc-interfaces';
import { OscParameterDeclaration } from './osc-parameter-declaration';
import { OscPersonDescription } from './osc-person-description';

export class OscDriver extends AbstractController {

	private m_ParameterDeclarations: OscParameterDeclaration[];
	private m_Description: OscPersonDescription;

}
