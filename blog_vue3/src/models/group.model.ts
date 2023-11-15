export interface Group {
    blogGroup: BlogGroup,
    photoUrl: PhotoUrl[]
}

export interface BlogGroup {
    groupId: number
    groupName: string,
    id: number,
    userId: number,
    usersId: string
}


interface PhotoUrl {
    id: string,
    photoUrl: string
}