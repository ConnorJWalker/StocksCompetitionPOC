import UpdaterBase from './updater-base'
import IAccountValue from '../../shared/models/iaccount-value'
import { IUserWithSecrets } from '../../shared/models/iuser'
import Redis from '../../shared/config/redis'
import Trading212Service from '../../shared/services/trading212-service'
import DatabaseService from '../../shared/services/database-service'
import { AccountValueResponseFromT212 } from '../../shared/models/dto/iaccount-value-response'

export default class AccountValueUpdater extends UpdaterBase<IAccountValue> {
    /**
     * The number of requests that should be waited until saving the value to the database
     *
     * @type {number}
     * @private
     */
    private readonly updateDatabaseAt: number

    /**
     * The maximum percentage of cash the users account is allowed to be before receiving a
     * disqualification strike
     *
     * @type {number}
     * @private
     */
    private readonly maxCashPercentage: number

    /**
     * The current response count, incremented after each group of requests is sent. Resets
     * back to zero when reaching updateDatabaseAt value. Starts at maximum to ensure first
     * response received is saved to database when starting the application
     *
     * @type {number}
     * @private
     */
    private responseCount: number

    /**
     * Array of user ids of users whose account values contained a higher percentage of cash
     * than permitted
     *
     * @type {number[]}
     */
    public userIdsToStrike: number[] = []

    /**
     * Constructor
     *
     * @param {number} updateDatabaseAt Number of responses to wait before saving to database
     * @param {number} maxCashPercentage Max percentage of users account allowed to be cash
     */
    constructor(updateDatabaseAt: number, maxCashPercentage: number) {
        super()

        this.updateDatabaseAt = updateDatabaseAt
        this.responseCount = updateDatabaseAt
        this.maxCashPercentage = maxCashPercentage
    }

    /**
     * Fetches the account values for all users accounts and stores to redis, emitting and event. Every
     * nth response also gets saved to the database and will have the account values checked to ensure
     * the cash percentage is in the permitted limit
     *
     * @param {IUserWithSecrets[]} users List of users with valid api keys to check open positions for
     */
    public async update(users: IUserWithSecrets[]) {
        this.users = users
        this.userIdsToStrike = []

        const accountValues = await this.getTrading212Values(user => Trading212Service.GetCash(user.apiKey))

        if (this.responseCount === this.updateDatabaseAt) {
            await DatabaseService.AddAccountValues(this.users, accountValues)
            this.calculateUserStrikes(accountValues)
        }

        const redisValues = JSON.stringify(AccountValueResponseFromT212(accountValues, this.users))
        await Redis.set('t212-account-values', redisValues)
        await Redis.publish('account-values-update', redisValues)

        this.responseCount = this.responseCount === this.updateDatabaseAt ? 0 : this.responseCount + 1
    }

    /**
     * Calculate any users accounts have over the permitted percentage of cash, adding them to the
     * userIdsToStrike array over the limit
     *
     * @param {IAccountValue[]} accountValues List of account values received from trading212
     * @private
     */
    private calculateUserStrikes(accountValues: IAccountValue[]) {
        accountValues.forEach((value, index) => {
            if (value.cash === 0 || value.total === 0) return

            const cashPercentage = (value.cash / value.total) * 100
            if (cashPercentage > this.maxCashPercentage) {
                this.userIdsToStrike.push(this.users[index].id)
            }
        })
    }
}
