import ISignupForm from '../models/dto/isignup-form'
import DatabaseService from '../services/database-service'

export default class SignUpValidator {
    public validationErrors: { [key: string]: string[] } = {}

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
        this.validateDisplayColour(body.displayColour)

        // TODO: check discord username is valid
        // TODO: check api key is valid

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
