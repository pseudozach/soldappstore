export interface Dapp {
  id?: string
  title: string
  description: string
  link: string
  pubkey: string
  category: string
  categories: [string]
  upVotesCount: number
  downVotesCount: number
  createdAt: firebase.default.firestore.Timestamp;
  updatedAt: firebase.default.firestore.Timestamp;
}