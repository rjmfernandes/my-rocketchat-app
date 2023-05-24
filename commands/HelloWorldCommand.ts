import { IRead, IModify, IHttp, IPersistence, IModifyCreator } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { ISlashCommand } from "@rocket.chat/apps-engine/definition/slashcommands/ISlashCommand";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { sendMessage } from '../utils/MessageUtils';

export class HelloWorldCommand implements ISlashCommand {
    command: string = 'hello';
    i18nParamsExample: string = 'hello_world_command_params_example';
    i18nDescription: string = 'hello_world_command_description';
    providesPreview: boolean = false;
    async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const creator: IModifyCreator = modify.getCreator()
        const sender: IUser = (await read.getUserReader().getAppUser()) as IUser
        const room: IRoom = context.getRoom()
        sendMessage(room, 'Hello, World!', sender, modify);
    }
}
