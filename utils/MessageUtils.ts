import { IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IMessage } from "@rocket.chat/apps-engine/definition/messages";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";

export function sendMessage(room: IRoom, textMessage: string, author: IUser, modify: IModify) {
    const messageBuilder = modify.getCreator().startMessage({
        text: textMessage,
    } as IMessage);
    messageBuilder.setRoom(room);
    messageBuilder.setSender(author);
    modify.getCreator().finish(messageBuilder);
}
export async function notifyMessage(room: IRoom, read: IRead, sender: IUser, message: string): Promise<void> {
    const notifier = read.getNotifier();
    const messageBuilder = notifier.getMessageBuilder();
    messageBuilder.setText(message);
    messageBuilder.setRoom(room);
    notifier.notifyUser(sender, messageBuilder.getMessage());
}
