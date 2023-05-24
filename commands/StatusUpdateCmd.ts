import { IRead, IModify, IHttp, IPersistence } from "@rocket.chat/apps-engine/definition/accessors";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { ISlashCommand } from "@rocket.chat/apps-engine/definition/slashcommands/ISlashCommand";
import { notifyMessage } from '../utils/MessageUtils';
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms/IRoom";

export class StatusUpdateCmd implements ISlashCommand {
    command: string = 'st';
    i18nParamsExample: string = 'status_update_command_params_example';
    i18nDescription: string = 'status_update_command_description';
    providesPreview: boolean = false;
    async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const user = context.getSender();
        const params = context.getArguments();
        const room: IRoom = context.getRoom();
        if (!params || params.length == 0) {
            return notifyMessage(room, read, user, "At least one status argument is mandatory. A second argument can be passed as status text.");
        }
        let status = params[0];
        let statusText = params.length > 1 ? params.slice(1).join(' ') : '';
        modify.getUpdater().getUserUpdater().updateStatus(user, statusText, status);
        notifyMessage(room, read, user, "Status updated to " + status + " (" + statusText + ").");
    }
}
