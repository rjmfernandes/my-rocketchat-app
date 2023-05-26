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
import { GetRequestCommand } from './commands/GetRequestCommand';
import { PostRequestCommand } from './commands/PostRequestCommand';
import { HttpRequestCommand } from './commands/HttpRequestCommand';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings/SettingType';
import { RocketChatHeaderBuilder } from './commands/RocketChatHeaderBuilder';
import { OpenCtxBarCommand } from './commands/OpenCtxBarCommand';

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
        const getRequestCommand: GetRequestCommand = new GetRequestCommand();
        await configuration.slashCommands.provideSlashCommand(getRequestCommand);
        const postRequestCommand: PostRequestCommand = new PostRequestCommand();
        await configuration.slashCommands.provideSlashCommand(postRequestCommand);
        const httpRequestCommand: HttpRequestCommand = new HttpRequestCommand('http');
        await configuration.slashCommands.provideSlashCommand(httpRequestCommand);
        const rocketchatRequestCommand: HttpRequestCommand = new HttpRequestCommand('rc',new RocketChatHeaderBuilder());
        await configuration.slashCommands.provideSlashCommand(rocketchatRequestCommand);
        const contextualBarCommand: OpenCtxBarCommand = new OpenCtxBarCommand();
        await configuration.slashCommands.provideSlashCommand(contextualBarCommand);

        await configuration.settings.provideSetting({
            id: 'my_rocketchat_app_auth_token',
            type: SettingType.PASSWORD,
            packageValue: 'YOUR_AUTH_TOKEN',
            required: true,
            public: false,
            multiline: false,
            i18nLabel: 'my_rocketchat_app_auth_token_name',
            i18nDescription: 'my_rocketchat_app_auth_token_desc',
        });

        await configuration.settings.provideSetting({
            id: 'my_rocketchat_app_user_id',
            type: SettingType.STRING,
            packageValue: 'YOUR_AUTH_TOKEN',
            required: true,
            public: false,
            multiline: false,
            i18nLabel: 'my_rocketchat_app_user_id_name',
            i18nDescription: 'my_rocketchat_app_user_id_desc',
        });

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
