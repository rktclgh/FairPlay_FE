import api from '../api/axios';

// 백엔드 FileUploadResponseDto와 동일한 타입
export interface FileUploadResponse {
    key: string;        // S3 key (temp 경로)
    url: string;        // 프론트 미리보기용 (백엔드 프록시 다운로드 URL)
    name: string;       // 원본 파일명(표시용)
    type: string;       // MIME 타입
    isImage: boolean;
    fileSize?: number;  // 파일 크기 (바이트)
}

export const uploadAPI = {
    /**
     * 파일 임시 업로드
     * @param file - 업로드할 파일
     * @returns 업로드 결과 정보
     */
    uploadTempFile: async (file: File): Promise<FileUploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/api/uploads/temp', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },

    /**
     * 파일 다운로드 URL 생성
     * @param key - S3 키
     * @returns 다운로드 URL
     */
    getDownloadUrl: (key: string): string => {
        return `/api/uploads/download?key=${encodeURIComponent(key)}`;
    },

    /**
     * 여러 파일 동시 업로드
     * @param files - 업로드할 파일 배열
     * @returns 업로드 결과 배열
     */
    uploadMultipleFiles: async (files: File[]): Promise<FileUploadResponse[]> => {
        const uploadPromises = files.map(file => uploadAPI.uploadTempFile(file));
        return Promise.all(uploadPromises);
    },

    /**
     * 파일 크기 검증
     * @param file - 검증할 파일
     * @param maxSizeMB - 최대 크기 (MB)
     * @returns 검증 결과
     */
    validateFileSize: (file: File, maxSizeMB: number = 10): boolean => {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        const isValid = file.size <= maxSizeBytes;
        console.log(`파일 크기 검증: ${file.name}, 크기: ${file.size} bytes (${uploadAPI.formatFileSize(file.size)}), 최대: ${maxSizeMB}MB (${maxSizeBytes} bytes), 결과: ${isValid}`);
        return isValid;
    },

    /**
     * 파일 크기를 읽기 쉬운 형식으로 변환
     * @param bytes - 바이트 크기
     * @returns 변환된 크기 문자열
     */
    formatFileSize: (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * 파일 타입 검증
     * @param file - 검증할 파일
     * @param allowedTypes - 허용된 파일 타입 배열
     * @returns 검증 결과
     */
    validateFileType: (file: File, allowedTypes: string[]): boolean => {
        return allowedTypes.some(type => {
            if (type.includes('/')) {
                // MIME 타입으로 검증
                return file.type === type;
            } else {
                // 확장자로 검증
                return file.name.toLowerCase().endsWith(`.${type.toLowerCase()}`);
            }
        });
    },

    /**
     * 이미지 파일 검증
     * @param file - 검증할 파일
     * @returns 이미지 파일 여부
     */
    isImageFile: (file: File): boolean => {
        return uploadAPI.validateFileType(file, ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']);
    },

    /**
     * 문서 파일 검증  
     * @param file - 검증할 파일
     * @returns 문서 파일 여부
     */
    isDocumentFile: (file: File): boolean => {
        return uploadAPI.validateFileType(file, [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/haansofthwp',
            'application/x-hwp',
            'pdf', 'doc', 'docx', 'hwp'
        ]);
    }
};