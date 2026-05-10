export interface Brief {
    conversation_id: number
    summary: string
    created_at: string
    conversations: {
        clients: {
            first_name: string
            last_name: string
            organisation: string
        }[]
    }[]
}