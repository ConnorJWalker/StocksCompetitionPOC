 SELECT * FROM (
     SELECT
            User.id,
            User.displayName,
            User.discordUsername,
            User.profilePicture,
            User.displayColour,
            User.createdAt,
            User.updatedAt,
            AccountValues.id AS accountValuesId,
            AccountValues.cash AS accountValuesCash,
            AccountValues.invested AS accountValuesInvested,
            AccountValues.gainLoss AS accountValuesGainLoss,
            AccountValues.createdAt AS accountValuesCreatedAt,
            AccountValues.updatedAt AS accountValuesUpdatedAt
    FROM Users AS User
    LEFT OUTER JOIN AccountValues AS AccountValues
    ON User.id = AccountValues.UserId AND AccountValues.createdAt >= :date
    GROUP BY date_format(accountValuesCreatedAt, '%Y%m%d%H'), AccountValues.UserId
) AS Result
WHERE :condition;