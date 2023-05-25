import { IRead, IModify, IHttp, IPersistence, IHttpResponse } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { ISlashCommand } from "@rocket.chat/apps-engine/definition/slashcommands/ISlashCommand";
import { get, post, jsonFormat } from "../utils/HttpUtils";
import { notifyMessage, sendMessage } from "../utils/MessageUtils";

export class RocketChatRequestCommand implements ISlashCommand {
    command: string = 'rc';
    i18nParamsExample: string ='rocketchat_request_command_params_example';
    i18nDescription: string ='rocketchat_request_command_description';
    providesPreview: boolean = false;
    async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const user = context.getSender();
        const params = context.getArguments();
        const room: IRoom = context.getRoom();
        const customHeaders = await buildHeaders(read);

        if (!params || params.length < 2) {
            return notifyMessage(room, read, user, "The HTTP method and URL arguments are mandatory.");
        }

        const method = params[0];
        let response: IHttpResponse;

        switch (method) {
            case 'GET':
                response = await get(params[1],http,customHeaders);
                break;
            case 'POST':
                if (params.length < 3) {
                    return notifyMessage(room, read, user, "The payload argument is mandatory for POST.");
                }

                response = await post(params[1], params[2],http,customHeaders);
                break;
            default:
                return notifyMessage(room, read, user, `The HTTP method ${method} is not implemented.`);
        }

        const message = jsonFormat(response);
        sendMessage(room, message, user, modify);
    }
}
async function buildHeaders(read: IRead) : Promise<any> {
    const authToken = await read.getEnvironmentReader().getSettings().getValueById('my_rocketchat_app_auth_token');
    const userId = await read.getEnvironmentReader().getSettings().getValueById('my_rocketchat_app_user_id');
    const customHeader=`{"X-Auth-Token": "${authToken}","X-User-Id": "${userId}"}`;
    return JSON.parse(customHeader);
}

