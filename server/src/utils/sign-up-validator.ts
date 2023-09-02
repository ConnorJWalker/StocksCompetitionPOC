import ISignupForm from '../models/dto/isignup-form'

export default class SignUpValidator {
    public validationErrors: { [key: string]: string[] } = {}

    public formFromRequestBody(body: any): ISignupForm | null {
        this.validationErrors = {}

        if (!(body instanceof Object)) {
            this.addError('request', 'request body must be an object')
            return null
        }

        this.validateRequiredFields(body)

        if (body.password !== body.passwordConfirm) {
            this.addError('passwordConfirm', 'passwords must match')
        }

        // TODO: check colour hex is valid
        // TODO: check user doesnt already exist
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

    private addError(field: string, error: string) {
        this.validationErrors[field] === undefined
            ? this.validationErrors[field] = [error]
            : this.validationErrors[field].push(error)
    }
}
