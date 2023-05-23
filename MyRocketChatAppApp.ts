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
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms/IRoom';
import { IUser } from '@rocket.chat/apps-engine/definition/users/IUser';

export class MyRocketChatAppApp extends App implements IPreMessageSentPrevent, IPostMessageSent {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
        logger.debug('Hello, World!');
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
        this.sendMessage(general, msg, author?author:message.sender, modify);
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
