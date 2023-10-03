SELECT * FROM (
	SELECT 'order' AS postType, id, UserId, createdAt
	FROM OrderHistories
	UNION ALL
	SELECT 'disqualification' AS postType, id, UserId, updatedAt as createdAt
	FROM Disqualifications
	WHERE disqualified = 1
)
AS merged
WHERE :condition
ORDER BY merged.createdAt DESC
LIMIT :limit OFFSET :offset;