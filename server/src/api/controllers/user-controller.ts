import { Response } from 'express'
import { RequestWithTargetUser } from '../middleware/get-profile-user'
import DatabaseService from '../../shared/services/database-service'
import SignUpValidator from '../utils/sign-up-validator'
import databaseService from '../../shared/services/database-service'
import DiscordService from '../../shared/services/discord-service'

const Follow = async (req: RequestWithTargetUser, res: Response) => {
    if (req.targetUser!.id === req.authenticatedUser!.id) {
        return res.status(400).json({ error: 'You cannot follow yourself' })
    }

    await DatabaseService.ToggleUserFollow(req.authenticatedUser!.id, req.targetUser!.id)
    return res.status(200).json({})
}

const IsFollowing = async (req: RequestWithTargetUser, res: Response) => {
    if (req.targetUser!.id === req.authenticatedUser!.id) {
        return res.status(200).json({ isFollowing: false })
    }

    const isFollowing = await DatabaseService.IsUserFollowing(req.authenticatedUser!.id, req.targetUser!.id)
    return res.status(200).json({ isFollowing })
}

const GetFollowing = async (req: RequestWithTargetUser, res: Response) => {
    return res.json(await DatabaseService.GetFollowingList(req.authenticatedUser!.id))
}

const ApiKeyIsValid = async (req: RequestWithTargetUser, res: Response) => {
    return res.json({ isValid: await DatabaseService.UserApiKeyIsValid(req.authenticatedUser!.id) })
}

const UpdateApiKey = async (req: RequestWithTargetUser, res: Response) => {
    if (req.body.apiKey === undefined) {
        return res.status(400).json({ error: 'Api key is required' })
    }

    const validUsers = await databaseService.GetAllUsersWithValidApiKeys()
    if (validUsers.find(user => user.id === req.authenticatedUser!.id) !== undefined) {
        return res.status(400).json({ error: 'Api key is already valid' })
    }

    const validator = new SignUpValidator()
    await validator.validateApiKey(req.body.apiKey)

    if (validator.validationErrors['apiKey'] !== undefined && validator.validationErrors['apiKey'].length !== 0) {
        return res.status(400).json({ errors: validator.validationErrors })
    }

    await DatabaseService.SetApiKey(req.body.apiKey, req.authenticatedUser!.id)
    return res.status(200).json({})
}

const UpdateDisplayName = async (req: RequestWithTargetUser, res: Response) => {
    if (!req.body.displayName) return res.status(400).json({ error: 'Display name is required' })

    await DatabaseService.UpdateDisplayName(req.authenticatedUser!.id, req.body.displayName)
    return res.status(200).json({})
}

const UpdateDiscordProfilePicture = async (req: RequestWithTargetUser, res: Response) => {
    const discordProfilePicture = await DiscordService.GetProfilePicture(req.authenticatedUser!.discordUsername)
    await DatabaseService.UpdateDiscordProfilePicture(req.authenticatedUser!.id, discordProfilePicture)

    return res.status(200).json({})
}

export default {
    Follow,
    IsFollowing,
    GetFollowing,
    ApiKeyIsValid,
    UpdateApiKey,
    UpdateDisplayName,
    UpdateDiscordProfilePicture
}