import UpdaterBase from './updater-base'
import IOpenPositions from 'shared-models/iopen-positions'
import { IUserWithSecrets } from 'shared-models/iuser'
import IOpenPositionsUpdates from 'shared-models/database/iopen-positions-updates'
import { IDbOrderHistory } from 'shared-models/database/iorder-history'
import Trading212Service from 'shared-server/services/trading212-service'
import DatabaseService from 'shared-server/services/database-service'
import DiscordService from 'shared-server/services/discord-service'

type TickerDict = { [key: string]: number }

export default class OpenPositionsUpdater extends UpdaterBase<IOpenPositions> {
    /**
     * New, updated and removed open positions, grouped by user id for storage in database
     *
     * @type {{[p: number]: IOpenPositionsUpdates}}
     * @private
     */
    private openPositionsUpdates: { [key: number]: IOpenPositionsUpdates } = {}

    /**
     * Array of new orders to be saved to the database
     *
     * @type {IDbOrderHistory[]}
     * @private
     */
    private newOrderHistories: IDbOrderHistory[] = []

    /**
     * Dictionary containing trading212 tickers as the key and the stocks current price as the value. Used
     * to get the value for sell orders that no longer returned by trading212
     *
     * @type {TickerDict}
     * @private
     */
    private previousOrderPrices: TickerDict = {}

    /**
     * Temporary dictionary used to provide values for previousOrderPrices. Value reset every update run
     *
     * @type {TickerDict}
     * @private
     */
    private currentOrderPrices: TickerDict = {}

    /**
     * Compares the open positions stored in the database against open positions returned by trading212
     * to determine if the user has bought or sold shares, storing the changed values
     *
     * @param {IUserWithSecrets[]} users List of users with valid api keys to check open positions for
     */
    public async update(users: IUserWithSecrets[]) {
        this.users = users
        this.openPositionsUpdates = {}
        this.newOrderHistories = []
        this.currentOrderPrices = {}

        // TODO: remove when resolved
        let trading212OpenPositions: IOpenPositions[] = [], databaseOpenPositions: IOpenPositions[] = []
        try {
            trading212OpenPositions = await this.getTrading212Values(user => Trading212Service.GetOpenPositions(user))
            databaseOpenPositions = await DatabaseService.GetOpenPositions(this.users.map(user => user.id))

            for (const user of this.users) {
                const userDatabaseOpenPositions = databaseOpenPositions.find(position => position.user.id === user.id)
                const userTrading212OpenPositions = trading212OpenPositions.find(position => position.user.id === user.id)

                this.openPositionsUpdates[user.id] = { new: [], updated: [], removed: [] }

                const handledTickers = await this.handleUpdatedValues(userDatabaseOpenPositions, userTrading212OpenPositions)

                if (userTrading212OpenPositions !== undefined) {
                    await this.handleNewValues(handledTickers, userTrading212OpenPositions)
                }
            }

            await DatabaseService.AddOrders(this.newOrderHistories)
            await DatabaseService.UpdateOpenPositions(this.openPositionsUpdates)

            this.previousOrderPrices = this.currentOrderPrices
        }
        catch (e) {
            console.log('trading212 open positions ', trading212OpenPositions)
            console.log('database open positions ', databaseOpenPositions)
            console.log('users ', this.users)

            await DiscordService.SendDisqualificationMessage(['if you are not connor ignore this pls'])

            throw e
        }
    }

    /**
     * Compares the open positions values stored in the database against the values returned by trading212 to
     * determine which have been updated or removed
     *
     * @param {IOpenPositions} databaseOpenPositions List of open positions returned by the database
     * @param {IOpenPositions} trading212OpenPositions List of open positions returned by trading212s api
     * @returns {Promise<Set<string>>} Set containing the trading212 tickers of positions that have been updated
     * @private
     */
    private async handleUpdatedValues(databaseOpenPositions?: IOpenPositions, trading212OpenPositions?: IOpenPositions): Promise<Set<string>> {
        const handledTickers = new Set<string>()
        if (databaseOpenPositions === undefined || trading212OpenPositions === undefined) return handledTickers

        const userId = databaseOpenPositions.user.id

        databaseOpenPositions.positions.forEach(databasePosition => {
            const trading212Position = trading212OpenPositions.positions.find(position => position.trading212Ticker === databasePosition.trading212Ticker)

            if (trading212Position === undefined) {
                this.openPositionsUpdates[userId].removed.push(databasePosition)
                this.newOrderHistories.push({
                    userId: databaseOpenPositions.user.id,
                    type: 'sell',
                    averagePrice: this.previousOrderPrices[databasePosition.trading212Ticker] === undefined ? -1 : this.previousOrderPrices[databasePosition.trading212Ticker],
                    quantity: databasePosition.quantity,
                    trading212Ticker: databasePosition.trading212Ticker
                })
            }
            else if (trading212Position.quantity !== databasePosition.quantity) {
                // Order is not new, just truncated in the database
                if (Math.abs(trading212Position.quantity - databasePosition.quantity) < 0.00001) {
                    handledTickers.add(databasePosition.trading212Ticker)
                    return
                }

                this.openPositionsUpdates[userId].updated.push({ ...databasePosition, quantity: trading212Position.quantity })
                this.newOrderHistories.push({
                    userId: databaseOpenPositions.user.id,
                    type: trading212Position.quantity > databasePosition.quantity ? 'buy' : 'sell',
                    averagePrice: trading212Position.currentPrice!,
                    quantity: Math.abs(trading212Position.quantity - databasePosition.quantity),
                    trading212Ticker: trading212Position.trading212Ticker
                })
            }

            handledTickers.add(databasePosition.trading212Ticker)
        })

        return handledTickers
    }

    /**
     * Compares the open positions values returned by trading212 against set of tickers that have already been updated
     * to determine which open positions are new. Stores current stock prices for use in future sell orders
     *
     * @param {Set<string>} handledTickers Set of tickers that have previously been stored, to be ignored by this function
     * @param {IOpenPositions} openPositions List of users open positions returned from trading212
     * @private
     */
    private async handleNewValues(handledTickers: Set<string>, openPositions: IOpenPositions): Promise<void> {
        this.openPositionsUpdates[openPositions.user.id].new = openPositions.positions.filter(position => {
            this.currentOrderPrices[position.trading212Ticker] = position.currentPrice!

            if (!handledTickers.has(position.trading212Ticker)) {
                this.newOrderHistories.push({
                    userId: openPositions.user.id,
                    type: 'buy',
                    averagePrice: position.currentPrice!,
                    quantity: position.quantity,
                    trading212Ticker: position.trading212Ticker
                })

                return true
            }

            return false
        })
    }
}
