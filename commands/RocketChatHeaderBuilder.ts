import { IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { HeaderBuilder } from "./HeaderBuilder";

export class RocketChatHeaderBuilder implements HeaderBuilder {
    async buildHeaders(read: IRead): Promise<any> {
        const authToken = await read.getEnvironmentReader().getSettings().getValueById('my_rocketchat_app_auth_token');
        const userId = await read.getEnvironmentReader().getSettings().getValueById('my_rocketchat_app_user_id');
        const customHeader = `{"X-Auth-Token": "${authToken}","X-User-Id": "${userId}"}`;
        return JSON.parse(customHeader);
    }
}
