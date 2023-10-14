import IAccountValueResponse from '../dto/iaccount-value-response'

export default interface IAccountValueUpdate {
    savedToDatabase: boolean
    values: IAccountValueResponse[]
}
