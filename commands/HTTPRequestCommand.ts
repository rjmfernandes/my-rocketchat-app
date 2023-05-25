import { IRead, IModify, IHttp, IPersistence } from "@rocket.chat/apps-engine/definition/accessors";
import { SlashCommandContext, ISlashCommandPreview, ISlashCommandPreviewItem } from "@rocket.chat/apps-engine/definition/slashcommands";
import { ISlashCommand } from "@rocket.chat/apps-engine/definition/slashcommands/ISlashCommand";
import { notifyMessage, sendMessage } from '../utils/MessageUtils';
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms/IRoom";

export class HTTPRequestCommand implements ISlashCommand {
    command: string = 'get';
    i18nParamsExample: string = 'http_request_command_params_example';
    i18nDescription: string = 'http_request_command_description';
    providesPreview: boolean = false;
    async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const user = context.getSender();
        const params = context.getArguments();
        const room: IRoom = context.getRoom();

        if (!params || params.length == 0) {
            return notifyMessage(room, read, user, "The URL argument is mandatory.");
        }

        const response = await http.get(params[0]);
        const message = '```\n'+JSON.stringify(response.data, null, 2)+'\n```';
        sendMessage(room, message, user, modify);
    }
}
