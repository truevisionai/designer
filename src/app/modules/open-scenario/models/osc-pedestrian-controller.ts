import { OscParameterDeclaration } from './osc-parameter-declaration';
import { OscPersonDescription } from './osc-person-description';
import { AbstractController } from './osc-interfaces';

export class OscPedestrianController extends AbstractController {

	private m_Name: string;
	private m_ParameterDeclaration: OscParameterDeclaration;
	private m_PersonDescription: OscPersonDescription;

}
