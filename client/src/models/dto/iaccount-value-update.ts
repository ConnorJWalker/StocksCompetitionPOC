import IAccountValueResponse from './feed/iaccount-value-response'

export default interface IAccountValueUpdate {
    savedToDatabase: boolean
    values: IAccountValueResponse[]
}
