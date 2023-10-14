import { Trading212Error } from 'shared-server/services/trading212-service'
import { FailureReason } from 'shared-models/ihttp-result'
import { IUserWithSecrets } from 'shared-models/iuser'

/**
 * @template T Type of trading212 result model to update
 */
export default class UpdaterBase<T> {
    /**
     * Array of user ids of users that got an unauthorised response from trading212 during
     * update run. Value is reset each run
     *
     * @type {number[]}
     */
    public unauthorizedUsers: number[] = []

    /**
     * Array of users to update values for, stored separately to the users parameter given to the
     * update function to allow for filtering out of users who got a non 200 response from trading212
     *
     * @type {IUserWithSecrets[]}
     * @protected
     */
    protected users: IUserWithSecrets[] = []

    /**
     * Maps list of settled promises into their resolved state, handling expired api keys and
     * rate limit errors. Ids of users that get an unauthorised response from trading212 are stored
     * for future use
     *
     * @param {PromiseSettledResult<T>[]} settled List of settled promises from trading 212 service
     * @returns {(T | null)[]} Array of resolved promise results or null on unsuccessful response
     */
    private resolvePromises(settled: PromiseSettledResult<T>[]): (T | null)[] {
        this.unauthorizedUsers = []

        return settled.map((value, index) => {
            if (value.status === 'fulfilled') return value.value

            const error = value.reason as Trading212Error
            if (error.reason === FailureReason.Unauthorised) {
                this.unauthorizedUsers.push(this.users[index].id)
            }

            return null
        })
    }

    /**
     * Sends requests for each user to trading212, filtering out responses and users that gained a non 200 response
     *
     * @param {(user: IUserWithSecrets) => Promise<T>} callback Function to call to get the desired trading212 value for the user
     * @returns {Promise<T[]>} Promise containing list of successful trading212 api responses
     * @protected
     */
    protected async getTrading212Values(callback: (user: IUserWithSecrets) => Promise<T>): Promise<T[]> {
        const responsePromises = this.users.map(user => callback(user))
        const responsesSettled = await Promise.allSettled(responsePromises)
        const responsesResolved = this.resolvePromises(responsesSettled)

        const users: IUserWithSecrets[] = []
        const filteredResponses = responsesResolved.filter((value, index) => {
            if (value === null) return false

            users.push(this.users[index])
            return true
        })

        this.users = users
        return filteredResponses as T[]
    }
}
