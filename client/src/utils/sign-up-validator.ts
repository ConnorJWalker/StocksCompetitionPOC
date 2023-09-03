import ISignupValidation, { GetEmptySignupValidation } from '../models/isignup-validation'
import ISignupForm from '../models/dto/isignup-form'

export default class SignUpValidator {
    public validationErrors: ISignupValidation = GetEmptySignupValidation()

    public validateDisplayName(displayName: string): string[] {
        this.validationErrors.displayName = []

        if (!displayName) {
            this.validationErrors.displayName.push('Display Name is required')
            return this.validationErrors.displayName
        }

        if (displayName.length < 3) {
            this.validationErrors.displayName.push('Display name must be 3 characters or more')
        }

        return this.validationErrors.displayName
    }

    public validateDiscordUsername(discordUsername: string): string[] {
        this.validationErrors.discordUsername = []

        if (!discordUsername) {
            this.validationErrors.discordUsername.push('Discord Username is required')
            return this.validationErrors.discordUsername
        }

        if (discordUsername.length < 2 || discordUsername.length > 32) {
            this.validationErrors.discordUsername.push('Discord Username must be between 2 and 32 characters long')
            return this.validationErrors.discordUsername
        }

        // TODO: add discord username exists check and isn't already signed up

        return this.validationErrors.discordUsername
    }

    public validatePassword(password: string): string[] {
        this.validationErrors.password = []

        if (!password) {
            this.validationErrors.password.push('Password is required')
            return this.validationErrors.password
        }

        if (password.length < 8) {
            this.validationErrors.password.push('Password must be 8 characters or more')
        }

        return this.validationErrors.password
    }

    public validateConfirmPassword(password: string, confirmPassword: string): string[] {
        this.validationErrors.confirmPassword = []

        if (!confirmPassword) {
            this.validationErrors.confirmPassword.push('Confirm Password is required')
            return this.validationErrors.confirmPassword
        }

        if (password !== confirmPassword) {
            this.validationErrors.confirmPassword.push('Passwords do not match')
        }

        return this.validationErrors.confirmPassword
    }

    public mainFormIsValid(signupForm: ISignupForm): boolean {
        this.validateDisplayName(signupForm.displayName)
        this.validateDiscordUsername(signupForm.discordUsername)
        this.validatePassword(signupForm.password)
        this.validateConfirmPassword(signupForm.password, signupForm.passwordConfirm)

        return this.validationErrors.displayName.length === 0 &&
            this.validationErrors.discordUsername.length === 0 &&
            this.validationErrors.password.length === 0 &&
            this.validationErrors.confirmPassword.length === 0
    }
}