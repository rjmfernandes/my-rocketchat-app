import {
    IAppAccessors,
    IHttp,
    ILogger,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IMessage } from '@rocket.chat/apps-engine/definition/messages';
import { IPreMessageSentPrevent } from '@rocket.chat/apps-engine/definition/messages/IPreMessageSentPrevent';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';

export class MyRocketChatAppApp extends App implements IPreMessageSentPrevent {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
        logger.debug('Hello, World!');
    }
    async checkPreMessageSentPrevent?(message: IMessage, read: IRead, http: IHttp): Promise<boolean> {
        return message.room.slugifiedName != 'general';
    }
    async executePreMessageSentPrevent(message: IMessage, read: IRead, http: IHttp, persistence: IPersistence): Promise<boolean> {
        return message.text == 'test';
    }
}
