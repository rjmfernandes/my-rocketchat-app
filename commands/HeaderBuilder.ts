import { IRead } from "@rocket.chat/apps-engine/definition/accessors/IRead";

export interface HeaderBuilder {

    buildHeaders(read: IRead) : Promise<any>;
}
