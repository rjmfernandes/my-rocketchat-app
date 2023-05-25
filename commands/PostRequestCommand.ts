import { IRead, IModify, IHttp, IPersistence } from "@rocket.chat/apps-engine/definition/accessors";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { ISlashCommand } from "@rocket.chat/apps-engine/definition/slashcommands/ISlashCommand";
import { notifyMessage, sendMessage } from '../utils/MessageUtils';
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms/IRoom";

export class PostRequestCommand implements ISlashCommand {
    command: string = 'post';
    i18nParamsExample: string = 'post_request_command_params_example';
    i18nDescription: string = 'post_request_command_description';
    providesPreview: boolean = false;
    async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const user = context.getSender();
        const params = context.getArguments();
        const room: IRoom = context.getRoom();

        if (!params || params.length < 2) {
            return notifyMessage(room, read, user, "The URL and payload arguments are mandatory.");
        }

        let payload = params[1];
        let payloadObj =JSON.parse(payload);

        let options ={
            content: JSON.stringify(payloadObj),
            headers: JSON.parse('{\"content-type\": \"application/json\"}')
        };

        const response = await http.post(params[0], options);

        const message = '```\n'+JSON.stringify(response.data, null, 2)+'\n```';
        sendMessage(room, message, user, modify);
    }
}
