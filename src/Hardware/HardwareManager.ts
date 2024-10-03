import { injectable, singleton } from "tsyringe";
import { HardwareController } from "./HardwareController";

@singleton()
@injectable()
export class HardwareManager
{

    controllers: HardwareController[] = [];

    registerController(ctrl: HardwareController) {
        this.controllers.push(ctrl);
    }

}