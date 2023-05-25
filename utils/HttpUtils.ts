import { IHttp, IHttpResponse } from "@rocket.chat/apps-engine/definition/accessors/IHttp";

export function get(url: string, http: IHttp,customHeaders?: any): Promise<IHttpResponse> {
    let options = {
        headers: headers(customHeaders)
    };
    return http.get(url,options);
}

export function post(url: string, payload: string, http: IHttp,customHeaders?: any): Promise<IHttpResponse> {
    let payloadObj = JSON.parse(payload);
    let options = {
        content: JSON.stringify(payloadObj),
        headers: headers(customHeaders)
    };
    return http.post(url, options);
}

export function jsonFormat(response: IHttpResponse): string {
    return '```\n'+JSON.stringify(response.data, null, 2)+'\n```';
}

function headers(customHeaders: any) {
    let defaultHeaders = JSON.parse('{\"content-type\": \"application/json\"}');
    return customHeaders?{...defaultHeaders,...customHeaders}:defaultHeaders;
}
