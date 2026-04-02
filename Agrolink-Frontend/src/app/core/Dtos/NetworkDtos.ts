export interface NetworkUserDto {
    userId: string;
    username: string;
    role: string;
    profilePicture: string;
    connectionCount: number;
    isConnected: boolean;
    isRequestSent: boolean;
    isRequestReceived: boolean;
}

export interface ConnectionRequestDto {
    requestId: string;
    fromUserId: string;
    fromUserName: string;
    fromUserRole: string;
    fromUserProfilePicture: string;
   
    sentDate: Date;
}

export interface ProfileStatsDto {
    name: string;
    role: string;
    profilePicture: string;
    connectionCount: number;
    requestCount: number;
}

export interface NetworkPageDto {
    myProfile: ProfileStatsDto;
    users: NetworkUserDto[];
    requests: ConnectionRequestDto[];
    sentRequests:SentRequestDto[];
    totalUsers: number;
    currentPage: number;
    totalPages: number;
}

export interface SentRequestDto {
    requestId: string;
  
    toUserId: string;
    toUserName: string;
    toUserRole: string;
    toUserProfilePicture: string;
   
    sentDate: Date;
}

export interface connectionsDto{
     

    connectedUserID: string;
    connectedUserName : string;
    connectedProfileUrl : string;
    

}