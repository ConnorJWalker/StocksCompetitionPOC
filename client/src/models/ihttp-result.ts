export default interface IHttpResult<T> {
    ok: boolean
    statusCode: number
    content: T
}

export interface IHttpErrorResult {
    error?: string
    errors?: object
}
