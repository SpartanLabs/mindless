import { injectable } from 'inversify';

@injectable()
export abstract class Controller {
	constructor() { 
		console.log("abstract consturct");
	}
}