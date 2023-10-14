import IHttpResult, { IHttpErrorResult } from './ihttp-result'

export default class HttpError extends Error {
    public statusCode: number
    public response: IHttpErrorResult

    constructor(httpResult: IHttpResult<IHttpErrorResult>) {
        super()

        this.statusCode = httpResult.statusCode
        this.response = httpResult.content
    }
}