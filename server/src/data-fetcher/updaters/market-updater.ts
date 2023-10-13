import Trading212Service from '../../shared/services/trading212-service'
import DatabaseService from '../../shared/services/database-service'
import Redis from '../../shared/config/redis'

export default class MarketUpdater {
    /**
     * Api key used to access the trading212 api
     *
     * @type {string}
     * @private
     */
    private readonly apiKey: string

    /**
     * The day of the month when the markets opening hours and available instruments list
     * was last updated
     *
     * @type {number}
     * @private
     */
    private dayLastUpdated: number = -1

    /**
     * Timestamp of the earliest stock markets opening time for the current date
     *
     * @type {number}
     * @private
     */
    private earliestOpen: number = Number.MAX_VALUE

    /**
     * Timestamp of the earliest stock markets premarket opening time for the current date
     *
     * @type {number}
     * @private
     */
    private earliestPreMarketOpen: number = Number.MAX_VALUE

    /**
     * Timestamp of the latest stock markets closing time for the current date
     *
     * @type {number}
     * @private
     */
    private latestClose: number = 0

    /**
     * Timestamp of the latest stock markets post market closing time for the current date
     *
     * @type {number}
     * @private
     */
    private latestPostMarketClose: number = 0

    constructor(apiKey: string) {
        this.apiKey = apiKey
    }

    /**
     * Updates the stock markets opening times and instruments list if it is a new day
     * and not currently the weekend
     */
    public async update() {
        const currentDay = new Date(Date.now()).getDate()
        if (this.dayLastUpdated !== currentDay && this.isWeekday()) {
            await this.updateMarketTimes(currentDay)
            await this.updateInstrumentsTable()

            this.dayLastUpdated = currentDay
        }
    }

    /**
     * Determines if the current time is within the markets opening times, ignoring pre-markets
     * and post-markets
     *
     * @returns {boolean} True if users should receive disqualification strikes
     */
    public shouldStrikeUsers(): boolean {
        const now = Date.now()
        return this.isWeekday() && now > this.earliestOpen && now < this.latestClose
    }

    /**
     * Determines if the current time is withing the markets opening times, including pre-markets
     * and post-markets
     *
     * @returns {boolean} True if users account values should be updated
     */
    public shouldUpdateAccountValues(): boolean {
        const now = Date.now()
        return this.isWeekday() &&
            now > Math.min(this.earliestOpen, this.earliestPreMarketOpen) && now < Math.max(this.latestClose, this.latestPostMarketClose)
    }

    /**
     * @returns {boolean} True if the current day is not a weekend
     * @private
     */
    private isWeekday(): boolean {
        const day = new Date(Date.now()).getDay()
        return day !== 0 && day !== 6
    }

    /**
     * Gets market opening times from trading212 and sets the earliest/latest opening times to the current
     * dates opening times
     *
     * @param {number} currentDay The current day of the month
     * @private
     */
    private async updateMarketTimes(currentDay: number) {
        this.earliestOpen = Number.MAX_VALUE
        this.earliestPreMarketOpen = Number.MAX_VALUE
        this.latestClose = 0
        this.latestPostMarketClose = 0

        const exchanges = await Trading212Service.GetExchangeList(this.apiKey)
        exchanges.forEach(exchange => {
            exchange.workingSchedules.forEach(schedule => {
                schedule.timeEvents.forEach(timeEvent => {
                    const date = new Date(Date.parse(timeEvent.date))
                    if (date.getDate() !== currentDay) return

                    switch (timeEvent.type) {
                        case 'PRE_MARKET_OPEN':
                            this.earliestPreMarketOpen = Math.min(this.earliestPreMarketOpen, date.getTime())
                            break
                        case 'OPEN':
                            this.earliestOpen = Math.min(this.earliestOpen, date.getTime())
                            break
                        case 'CLOSE':
                            this.latestClose = Math.max(this.latestClose, date.getTime())
                            break
                        case 'AFTER_HOURS_CLOSE':
                            this.latestPostMarketClose = Math.max(this.latestPostMarketClose, date.getTime())
                            break
                    }
                })
            })
        })
    }

    /**
     * Fetches all available instruments from trading212 and stores new instruments in the database
     *
     * @private
     */
    private async updateInstrumentsTable() {
        // Make sure instruments table hasn't been updated and then the program closed and rerun
        const redisLastUpdated = await Redis.get('instruments-last-updated')
        if (redisLastUpdated === null || parseInt(redisLastUpdated) === new Date(Date.now()).getDate()) {
            return
        }

        try {
            const instruments = await Trading212Service.GetAllStocks(this.apiKey)
            const addedInstruments = await DatabaseService.UpdateStocksList(instruments)
            await Redis.set('instruments-last-updated', new Date(Date.now()).getDate())

            console.log(`Saved ${addedInstruments} new stocks to the database`)
        }
        catch (e) {
            console.error(e)
        }
    }
}
