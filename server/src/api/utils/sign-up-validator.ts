import ISignupForm from '../models/dto/isignup-form'
import DatabaseService from '../../shared/services/database-service'
import Trading212Service from '../../shared/services/trading212-service'
import DiscordService, { DiscordError } from '../../shared/services/discord-service'
import { FailureReason } from '../../shared/models/ihttp-result'
import { RateLimitError } from '../models/errors'

export default class SignUpValidator {
    public validationErrors: { [key: string]: string[] } = {}
    private apiKeyErrors = {
        [FailureReason.Unauthorised]: 'api key is not accepted by the trading212 api',
        [FailureReason.MissingScope]: 'all permissions (except "orders - execute") must be given',
    }

    public async formFromRequestBody(body: any): Promise<ISignupForm | null> {
        this.validationErrors = {}

        if (!(body instanceof Object)) {
            this.addError('request', 'request body must be an object')
            return null
        }

        this.validateRequiredFields(body)

        this.validateDisplayName(body.displayName)

        if (body.password !== body.passwordConfirm) {
            this.addError('passwordConfirm', 'passwords must match')
        }

        await this.validateDiscordUsername(body.discordUsername)

        // prevent trading 212 api being contacted if there is no api key
        if (this.validationErrors['apiKey'] === undefined) {
            await this.validateApiKey(body.apiKey)
        }

        this.validateDisplayColour(body.displayColour)

        return Object.keys(this.validationErrors).length === 0
            ? body as ISignupForm
            : null
    }

    private validateRequiredFields(body: any) {
        const requiredFields: string[] = [
            'displayName', 'discordUsername', 'displayColour',
            'password', 'passwordConfirm', 'apiKey'
        ]

        requiredFields.forEach(field => {
            if (body[field] === undefined || body[field] === '') {
                this.addError(field, `${field} is required`)
            }
        })
    }

    public validateDisplayName(displayName: string) {
        displayName = displayName.trim()

        if (displayName.length < 3) {
            this.addError('displayName', 'display name must be 3 characters or more')
        }

        if (displayName.length > 32) {
            this.addError('displayName', 'display name must be 32 characters or less')
        }

        if (displayName.indexOf(':') !== -1) {
            this.addError('displayName', ': is a forbidden character')
        }
    }

    public async validateDiscordUsername(discordUsername: string) {
        if (discordUsername === undefined) return

        const user = await DatabaseService.FindUserByUsername(discordUsername)
        if (user !== null) {
            this.addError('discordUsername', `account already exists for ${discordUsername}`)
        }

        try {
            if (!await DiscordService.UserIsInDiscord(discordUsername)) {
                this.addError('discordUsername', `account ${discordUsername} is not currently in the discord server`)
            }
        }
        catch (error) {
            if (error instanceof DiscordError) {
                this.addError('discordUsername', error.message)
                return
            }

            throw error
        }
    }

    public async validateApiKey(apiKey: string) {
        if (apiKey === undefined) return

        const [success, reason] = await Trading212Service.ValidateApiKey(apiKey)
        if (success) return

        if (this.apiKeyErrors.hasOwnProperty(reason!)) {
            // @ts-ignore
            this.addError('apiKey', this.apiKeyErrors[reason!])
            return
        }

        if (reason === FailureReason.RateLimitExceeded) {
            throw new RateLimitError('trading212 rate limit reached during api key validation')
        }

        throw new Error('an unknown error occurred while accessing the trading212 api')
    }

    private validateDisplayColour(displayColour: string) {
        if (displayColour === undefined) return

        const regex = new RegExp("^#(?:[0-9a-fA-F]{3}){1,2}$")
        if (regex.exec(displayColour) === null) {
            this.addError('displayColour', 'display colour must be a valid rgb hex code')
        }
    }

    private addError(field: string, error: string) {
        this.validationErrors[field] === undefined
            ? this.validationErrors[field] = [error]
            : this.validationErrors[field].push(error)
    }
}
