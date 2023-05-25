import { IHttp, IHttpResponse } from "@rocket.chat/apps-engine/definition/accessors/IHttp";

export function get(url: string, http: IHttp): Promise<IHttpResponse> {
    let options = {
        headers: JSON.parse('{\"content-type\": \"application/json\"}')
    };
    return http.get(url,options);
}

export function post(url: string, payload: string, http: IHttp): Promise<IHttpResponse> {
    let payloadObj = JSON.parse(payload);

    let options = {
        content: JSON.stringify(payloadObj),
        headers: JSON.parse('{\"content-type\": \"application/json\"}')
    };

    return http.post(url, options);
}

export function jsonFormat(response: IHttpResponse): string {
    return '```\n'+JSON.stringify(response.data, null, 2)+'\n```';
}
