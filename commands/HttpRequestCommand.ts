import { IRead, IModify, IHttp, IPersistence, IHttpResponse } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { ISlashCommand } from "@rocket.chat/apps-engine/definition/slashcommands/ISlashCommand";
import { notifyMessage, sendMessage } from "../utils/MessageUtils";
import { get, jsonFormat, post } from "../utils/HttpUtils";
import { HeaderBuilder } from "./HeaderBuilder";

export class HttpRequestCommand implements ISlashCommand {
    command: string;
    i18nParamsExample: string = 'http_request_command_params_example';
    i18nDescription: string = 'http_request_command_description';
    providesPreview: boolean = false;
    headerBuilder: HeaderBuilder;

    constructor(command: string, headerBuilder?: HeaderBuilder) {
        this.command = command;
        if (headerBuilder)
            this.headerBuilder = headerBuilder;
    }

    async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const user = context.getSender();
        const params = context.getArguments();
        const room: IRoom = context.getRoom();

        if (!params || params.length < 2) {
            return notifyMessage(room, read, user, "The HTTP method and URL arguments are mandatory.");
        }

        const method = params[0];
        let response: IHttpResponse;
        let customHeader = this.headerBuilder ? await this.headerBuilder.buildHeaders(read) : {};

        switch (method) {
            case 'GET':
                response = await get(params[1], http, customHeader);
                break;
            case 'POST':
                if (params.length < 3) {
                    return notifyMessage(room, read, user, "The payload argument is mandatory for POST.");
                }

                response = await post(params[1], params[2], http, customHeader);
                break;
            default:
                return notifyMessage(room, read, user, `The HTTP method ${method} is not implemented.`);
        }

        const message = jsonFormat(response);
        sendMessage(room, message, user, modify);
    }
}
