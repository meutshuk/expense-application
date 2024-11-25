
declare interface EventUsers {
    id: string,
    name: string,
    email: string,
    role: ROLE
}


declare enum ROLE {
    CREATOR = 'creator',
    MEMBER = 'member'
}



