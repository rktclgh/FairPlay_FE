import axiosInstance from '../api/axios';

export interface LoginHistoryDto {
    id: number;
    userId: number;
    name: string;
    email: string;
    user_role_code_id: number;
    ip: string;
    userAgent: string;
    loginTime: string;
}

export interface ChangeHistoryDto {
    name: string;
    email: string;
    content: string;
    nickname: string;
    modifyTime: string;
    targetType: string;
}

export interface PageableResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        unpaged: boolean;
        paged: boolean;
    };
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface LoginLogsParams {
    page: number;
    size: number;
    email?: string;
    from?: string;
    to?: string;
}

export interface ChangeLogsParams {
    page: number;
    size: number;
    email?: string;
    type?: string;
    from?: string;
    to?: string;
}

export const adminSecurityService = {
    // 로그인 이력 조회
    getLoginLogs: async (params: LoginLogsParams): Promise<PageableResponse<LoginHistoryDto>> => {
        const response = await axiosInstance.get('/api/super-admin/get-login-logs', {
            params: {
                page: params.page,
                size: params.size,
                ...(params.email && { email: params.email }),
                ...(params.from && { from: params.from }),
                ...(params.to && { to: params.to })
            }
        });
        return response.data;
    },

    // 변경 이력 조회
    getChangeLogs: async (params: ChangeLogsParams): Promise<PageableResponse<ChangeHistoryDto>> => {
        const response = await axiosInstance.get('/api/super-admin/get-change-logs', {
            params: {
                page: params.page,
                size: params.size,
                ...(params.email && { email: params.email }),
                ...(params.type && { type: params.type }),
                ...(params.from && { from: params.from }),
                ...(params.to && { to: params.to })
            }
        });
        return response.data;
    }
};
