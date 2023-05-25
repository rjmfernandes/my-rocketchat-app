import { IRead, IModify, IHttp, IPersistence, IHttpResponse } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { ISlashCommand } from "@rocket.chat/apps-engine/definition/slashcommands/ISlashCommand";
import { notifyMessage, sendMessage } from "../utils/MessageUtils";

export class HttpRequestCommand implements ISlashCommand {
    command: string = 'http';
    i18nParamsExample: string = 'http_request_command_params_example';
    i18nDescription: string = 'http_request_command_description';
    providesPreview: boolean = false;
    async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const user = context.getSender();
        const params = context.getArguments();
        const room: IRoom = context.getRoom();

        if (!params || params.length < 2) {
            return notifyMessage(room, read, user, "The HTTP method and URL arguments are mandatory.");
        }

        const method = params[0];
        let response: IHttpResponse;

        switch (method) {
            case 'GET':
                response = await http.get(params[1]);
                break;
            case 'POST':
                if (params.length < 3) {
                    return notifyMessage(room, read, user, "The payload argument is mandatory for POST.");
                }
                let payload = params[2];
                let payloadObj = JSON.parse(payload);

                let options = {
                    content: JSON.stringify(payloadObj),
                    headers: JSON.parse('{\"content-type\": \"application/json\"}')
                };

                response = await http.post(params[1], options);
                break;
            default:
                return notifyMessage(room, read, user, `The HTTP method ${method} is not implemented.`);
        }

        const message = '```\n'+JSON.stringify(response.data, null, 2)+'\n```';
        sendMessage(room, message, user, modify);
    }
}
