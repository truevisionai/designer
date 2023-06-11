/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractController } from './osc-interfaces';
import { ParameterDeclaration } from './osc-parameter-declaration';
import { PersonDescription } from './osc-person-description';

export class PedestrianController extends AbstractController {

	private m_Name: string;
	private m_ParameterDeclaration: ParameterDeclaration;
	private m_PersonDescription: PersonDescription;

}
