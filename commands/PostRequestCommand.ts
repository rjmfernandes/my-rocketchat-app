import { IRead, IModify, IHttp, IPersistence } from "@rocket.chat/apps-engine/definition/accessors";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { ISlashCommand } from "@rocket.chat/apps-engine/definition/slashcommands/ISlashCommand";
import { notifyMessage, sendMessage } from '../utils/MessageUtils';
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms/IRoom";
import { jsonFormat, post} from "../utils/HttpUtils";

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

        const response = await post(params[0],params[1],http);
        const message = jsonFormat(response);
        sendMessage(room, message, user, modify);
    }
}
