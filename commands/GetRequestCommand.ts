import { IRead, IModify, IHttp, IPersistence } from "@rocket.chat/apps-engine/definition/accessors";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { ISlashCommand } from "@rocket.chat/apps-engine/definition/slashcommands/ISlashCommand";
import { notifyMessage, sendMessage } from '../utils/MessageUtils';
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms/IRoom";
import { get, jsonFormat } from "../utils/HttpUtils";

export class GetRequestCommand implements ISlashCommand {
    command: string = 'get';
    i18nParamsExample: string = 'get_request_command_params_example';
    i18nDescription: string = 'get_request_command_description';
    providesPreview: boolean = false;
    async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const user = context.getSender();
        const params = context.getArguments();
        const room: IRoom = context.getRoom();

        if (!params || params.length == 0) {
            return notifyMessage(room, read, user, "The URL argument is mandatory.");
        }

        const response = await get(params[0], http);
        const message = jsonFormat(response);
        sendMessage(room, message, user, modify);
    }
}
