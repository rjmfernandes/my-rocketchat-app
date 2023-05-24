import {
    IAppAccessors,
    IConfigurationExtend,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IMessage, IPostMessageSent } from '@rocket.chat/apps-engine/definition/messages';
import { IPreMessageSentPrevent } from '@rocket.chat/apps-engine/definition/messages/IPreMessageSentPrevent';
import { AppMethod, IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { IFileUploadContext } from '@rocket.chat/apps-engine/definition/uploads';
import { IPreFileUpload } from '@rocket.chat/apps-engine/definition/uploads/IPreFileUpload';
import { sendMessage, notifyMessage } from './utils/MessageUtils';
import { HelloWorldCommand } from './commands/HelloWorldCommand';
import { StatusUpdateCmd } from './commands/StatusUpdateCmd';

export class MyRocketChatAppApp extends App implements IPreMessageSentPrevent, IPostMessageSent, IPreFileUpload {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
        logger.debug('Hello, World!');
    }

    public async extendConfiguration(
        configuration: IConfigurationExtend
    ): Promise<void> {
        const helloWorldCommand: HelloWorldCommand = new HelloWorldCommand();
        await configuration.slashCommands.provideSlashCommand(helloWorldCommand);
        const statusUpdateCommand: StatusUpdateCmd = new StatusUpdateCmd();
        await configuration.slashCommands.provideSlashCommand(statusUpdateCommand);
    }

    async [AppMethod.EXECUTE_PRE_FILE_UPLOAD](context: IFileUploadContext, read: IRead, http: IHttp, persis: IPersistence, modify: IModify): Promise<void> {
        //this.getLogger().debug('ContentInspectionExampleAppApp - File Uploaded - Name: ' + context.file.name);
        //this.getLogger().debug('ContentInspectionExampleAppApp - File Uploaded - Type: ' + context.file.type);
        //this.getLogger().debug('ContentInspectionExampleAppApp - File Uploaded - Size: ' + context.file.size);

        console.log('ContentInspectionExampleAppApp - File Uploaded - Name: ' + context.file.name);
        console.log('ContentInspectionExampleAppApp - File Uploaded - Type: ' + context.file.type);
        console.log('ContentInspectionExampleAppApp - File Uploaded - Size: ' + context.file.size);

        if (context.file.type == 'text/plain') {
            /*this.getLogger().debug('ContentInspectionExampleAppApp - File Uploaded - Content: ' +
                String.fromCharCode.apply(null, context.content));*/
            console.log('ContentInspectionExampleAppApp - File Uploaded - Content: ' +
                String.fromCharCode.apply(null, context.content));
        }

        //if file was bad we could throw an exception
        //throw new FileUploadNotAllowedException('File is Bad');
        const user = await read.getUserReader().getById(context.file.userId);
        const room = await read.getRoomReader().getById(context.file.rid);
        if (room) {
            notifyMessage(room, read, user, 'File inspected - Check logs');
        }
    }
    async checkPostMessageSent?(message: IMessage, read: IRead, http: IHttp): Promise<boolean> {
        return message.room.slugifiedName != 'general';
    }
    async executePostMessageSent(message: IMessage, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify): Promise<void> {
        const general = await read.getRoomReader().getByName('general');
        if (!general) {
            return;
        }
        const msg = `@${message.sender.username} said "${message.text}" in #${message.room.displayName}`;
        const author = await read.getUserReader().getAppUser();
        sendMessage(general, msg, author ? author : message.sender, modify);
    }
    async checkPreMessageSentPrevent?(message: IMessage, read: IRead, http: IHttp): Promise<boolean> {
        return message.room.slugifiedName != 'general';
    }
    async executePreMessageSentPrevent(message: IMessage, read: IRead, http: IHttp, persistence: IPersistence): Promise<boolean> {
        return message.text == 'test';
    }
}
