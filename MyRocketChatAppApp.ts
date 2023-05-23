import {
    IAppAccessors,
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
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms/IRoom';
import { IFileUploadContext } from '@rocket.chat/apps-engine/definition/uploads';
import { IPreFileUpload } from '@rocket.chat/apps-engine/definition/uploads/IPreFileUpload';
import { IUser } from '@rocket.chat/apps-engine/definition/users/IUser';

export class MyRocketChatAppApp extends App implements IPreMessageSentPrevent, IPostMessageSent, IPreFileUpload {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
        logger.debug('Hello, World!');
    }
    async [AppMethod.EXECUTE_PRE_FILE_UPLOAD](context: IFileUploadContext, read: IRead, http: IHttp, persis: IPersistence, modify: IModify): Promise<void> {
        console.log('ContentInspectionExampleAppApp - File Uploaded - Name: ' + context.file.name);
        console.log('ContentInspectionExampleAppApp - File Uploaded - Type: ' + context.file.type);
        console.log('ContentInspectionExampleAppApp - File Uploaded - Size: ' + context.file.size);

        if (context.file.type == 'text/plain') {
            console.log('ContentInspectionExampleAppApp - File Uploaded - Content: ' +
                String.fromCharCode.apply(null, context.content));
        }

        //if file was bad we could throw an exception
        //throw new FileUploadNotAllowedException('File is Bad');
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
        this.sendMessage(general, msg, author ? author : message.sender, modify);
    }
    async checkPreMessageSentPrevent?(message: IMessage, read: IRead, http: IHttp): Promise<boolean> {
        return message.room.slugifiedName != 'general';
    }
    async executePreMessageSentPrevent(message: IMessage, read: IRead, http: IHttp, persistence: IPersistence): Promise<boolean> {
        return message.text == 'test';
    }
    sendMessage(room: IRoom, textMessage: string, author: IUser, modify: IModify) {
        const messageBuilder = modify.getCreator().startMessage({
            text: textMessage,
        } as IMessage);
        messageBuilder.setRoom(room);
        messageBuilder.setSender(author);
        modify.getCreator().finish(messageBuilder);
    }
}
