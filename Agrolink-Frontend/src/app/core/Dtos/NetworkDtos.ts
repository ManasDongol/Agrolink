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
    totalUsers: number;
    currentPage: number;
    totalPages: number;
}
