export interface Message {
    type: number,
    status: number,
    params: params
}

export interface params {
    message: string,
    fromUser: wsUser,
    toUser: wsUser,
    fileType:string
}

export interface paramsGroup {
    message: string,
    fromUser: wsUser,
    toUser: wsUser,
    groupId:string,
    fileType:string,
    nameList:string[]
}

export interface wsUser {
    userId: string,
    userName: string,
    loginStatus: string
}

export interface GroupMessage{
    type: number,
    status: number,
    params:paramsGroup
}