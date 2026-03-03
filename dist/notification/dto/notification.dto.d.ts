export declare class NotificationResponseDto {
    id: string;
    userId: string;
    type: string;
    title: string;
    body: string;
    taskId?: string | null;
    assignedByUserId?: string | null;
    read: boolean;
    createdAt: Date;
}
export declare class NotificationListResponseDto {
    data: NotificationResponseDto[];
    total: number;
    unreadCount: number;
}
