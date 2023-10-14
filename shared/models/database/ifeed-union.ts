export default interface IFeedUnion {
    postType: 'order' | 'disqualification'
    id: number
    UserId: number
    createdAt: string
}