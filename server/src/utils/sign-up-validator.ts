import ISignupForm from '../models/dto/isignup-form'
import DatabaseService from '../services/database-service'
import Trading212Service from '../services/trading212-service'
import { FailureReason } from '../models/ihttp-result'
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

        if (body.password !== body.passwordConfirm) {
            this.addError('passwordConfirm', 'passwords must match')
        }

        await this.validateUserIsUnique(body.discordUsername)
        await this.validateApiKey(body.apiKey)
        this.validateDisplayColour(body.displayColour)

        // TODO: check discord username is valid

        return Object.keys(this.validationErrors).length === 0
            ? body as ISignupForm
            : null
    }

    private validateRequiredFields(body: any) {
        const requiredFields: string[] = [
            'displayName', 'discordUsername', 'profilePicture', 'displayColour',
            'password', 'passwordConfirm', 'apiKey'
        ]

        requiredFields.forEach(field => {
            if (body[field] === undefined || body[field] === '') {
                this.addError(field, `${field} is required`)
            }
        })
    }

    private async validateUserIsUnique(discordUsername: string) {
        if (discordUsername === undefined) return

        const user = await DatabaseService.FindUserByUsername(discordUsername)
        if (user !== null) {
            this.addError('discordUsername', `account already exists for ${discordUsername}`)
        }
    }

    private async validateApiKey(apiKey: string) {
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

        console.log(reason!.toString())
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
