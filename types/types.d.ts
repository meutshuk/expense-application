
interface EventUsers {
    id: string,
    name: string,
    email: string,
    role: ROLE
}


enum ROLE {
    CREATOR = 'creator',
    MEMBER = 'member'
}



interface BasicUserInfo {
    id: string;
    name: string;
    email: string;
}