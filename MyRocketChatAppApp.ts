import {
    IAppAccessors,
    IConfigurationExtend,
    IHttp,
    ILivechatRead,
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
import { IUIKitInteractionHandler } from '@rocket.chat/apps-engine/definition/uikit/IUIKitActionHandler';
import { UIKitActionButtonInteractionContext, IUIKitResponse, BlockElementType, UIKitViewCloseInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { UIActionButtonContext } from '@rocket.chat/apps-engine/definition/ui/UIActionButtonContext';
import { ApiVisibility, ApiSecurity } from '@rocket.chat/apps-engine/definition/api';
import { Endpoint } from './endpoints/Endpoint';
import { IUIKitContextualBarViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';

export class MyRocketChatAppApp extends App implements IPreMessageSentPrevent, IPostMessageSent, IPreFileUpload, IUIKitInteractionHandler {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
        logger.debug('Hello, World!');
    }

    public async executeActionButtonHandler(
        context: UIKitActionButtonInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<IUIKitResponse> {
        const {
            buttonContext,
            actionId,
            triggerId,
            user,
            room,
            message
        } = context.getInteractionData();
        switch (actionId) {
            case 'my-action-id':
                const blockBuilder = modify.getCreator().getBlockBuilder();
                return context.getInteractionResponder().openModalViewResponse({
                    title: blockBuilder.newPlainTextObject('Interaction received'),
                    blocks: blockBuilder.addSectionBlock({
                        text: blockBuilder.newPlainTextObject('We received your interaction, thanks!')
                    }).getBlocks()
                });
            case 'my-omichannel-action-id':
                const contextualbarBlocks = await createContextualBarBlocks(modify,read.getLivechatReader());
                await modify.getUiController().openContextualBarView(contextualbarBlocks, { triggerId }, user);
        }
        return context.getInteractionResponder().successResponse();
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
        const rocketchatRequestCommand: HttpRequestCommand = new HttpRequestCommand('rc', new RocketChatHeaderBuilder());
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

        configuration.ui.registerButton({
            actionId: 'my-action-id',
            labelI18n: 'my-action-name',
            context: UIActionButtonContext.ROOM_ACTION,
        });
        configuration.ui.registerButton({
            actionId: 'my-omichannel-action-id',
            labelI18n: 'my-omnichannel-action-name',
            context: UIActionButtonContext.ROOM_ACTION,
        });

        configuration.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [new Endpoint(this)],
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
    public async executeViewClosedHandler(context: UIKitViewCloseInteractionContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify): Promise<IUIKitResponse> {
        return context.getInteractionResponder().successResponse();
    }
}

export async function createContextualBarBlocks(modify: IModify, livechatReader: ILivechatRead, viewId?: string): Promise<IUIKitContextualBarViewParam> {
    const blocks = modify.getCreator().getBlockBuilder();
    const departments = await livechatReader.getDepartmentsEnabledWithAgents();
    let text = '';
    for (let i = 0; i < departments.length; i++) {
        text = (text != '' ? text + '\n' : text);
        text = text + departments[i].name +': '+departments[i].numberOfAgents+' agents';
    }
    blocks.addSectionBlock({
        text: blocks.newMarkdownTextObject(text)
    });
    return {
        id: viewId || 'departmentsbarId',
        title: blocks.newPlainTextObject('Departments'),
        blocks: blocks.getBlocks()
    };
}
