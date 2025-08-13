import { useState } from 'react';
import { uploadAPI, FileUploadResponse } from '../services/upload';
import { toast } from 'react-toastify';
import type { FileUploadDto } from '../services/types/eventType';

interface UseFileUploadResult {
    uploadedFiles: Map<string, FileUploadResponse>; // usage를 키로 하는 맵
    isUploading: boolean;
    uploadFile: (file: File, usage: string) => Promise<FileUploadResponse | null>;
    removeFile: (usage: string) => void;
    getFileByUsage: (usage: string) => FileUploadResponse | null;
    getFileUploadDtos: () => FileUploadDto[];
    clearAllFiles: () => void;
}

export const useFileUpload = (): UseFileUploadResult => {
    const [uploadedFiles, setUploadedFiles] = useState<Map<string, FileUploadResponse>>(new Map());
    const [isUploading, setIsUploading] = useState(false);

    const uploadFile = async (file: File, usage: string): Promise<FileUploadResponse | null> => {
        // 용도별 파일 크기 제한 설정
        let maxSizeMB = 10; // 기본값
        let maxSizeLabel = '10MB';
        
        if (usage === 'banner' || usage === 'thumbnail') {
            maxSizeMB = 5; // 이미지 파일은 5MB
            maxSizeLabel = '5MB';
        } else if (usage === 'application_file' || usage === 'file') {
            maxSizeMB = 20; // 문서 파일은 20MB
            maxSizeLabel = '20MB';
        }

        // 파일 크기 검증
        if (!uploadAPI.validateFileSize(file, maxSizeMB)) {
            const currentSize = uploadAPI.formatFileSize(file.size);
            toast.error(`파일 크기는 ${maxSizeLabel} 이하여야 합니다. (현재 파일: ${currentSize})`);
            return null;
        }

        // 파일 타입 검증
        let isValidType = false;
        if (usage === 'banner' || usage === 'thumbnail') {
            isValidType = uploadAPI.isImageFile(file);
            if (!isValidType) {
                toast.error('이미지 파일만 업로드 가능합니다. (JPG, PNG, GIF)');
                return null;
            }
        } else if (usage === 'application_file' || usage === 'file') {
            isValidType = uploadAPI.isDocumentFile(file) || uploadAPI.isImageFile(file);
            if (!isValidType) {
                toast.error('문서 파일 또는 이미지 파일만 업로드 가능합니다. (PDF, DOC, DOCX, HWP, JPG, PNG)');
                return null;
            }
        } else {
            // 기타 용도는 모든 타입 허용
            isValidType = true;
        }

        if (!isValidType) {
            return null;
        }

        setIsUploading(true);
        try {
            const response = await uploadAPI.uploadTempFile(file);
            
            // 파일 크기 정보 추가
            const responseWithSize = {
                ...response,
                fileSize: file.size
            };
            
            // 업로드된 파일을 맵에 저장
            setUploadedFiles(prev => {
                const newMap = new Map(prev);
                newMap.set(usage, responseWithSize);
                return newMap;
            });

            toast.success(`${file.name} 파일이 업로드되었습니다.`);
            return response;
        } catch (error) {
            console.error('파일 업로드 실패:', error);
            // axios 인터셉터에서 이미 에러 토스트를 표시하므로 별도 처리 불필요
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const removeFile = (usage: string) => {
        setUploadedFiles(prev => {
            const newMap = new Map(prev);
            newMap.delete(usage);
            return newMap;
        });
    };

    const getFileByUsage = (usage: string): FileUploadResponse | null => {
        return uploadedFiles.get(usage) || null;
    };

    const getFileUploadDtos = (): FileUploadDto[] => {
        const dtos: FileUploadDto[] = [];
        
        uploadedFiles.forEach((fileResponse, usage) => {
            dtos.push({
                s3Key: fileResponse.key,
                originalFileName: fileResponse.name,
                fileType: fileResponse.type,
                fileSize: fileResponse.fileSize || 0, // FileUploadResponse에서 실제 파일 크기 가져오기
                usage: usage
            });
        });

        return dtos;
    };

    const clearAllFiles = () => {
        setUploadedFiles(new Map());
    };

    return {
        uploadedFiles,
        isUploading,
        uploadFile,
        removeFile,
        getFileByUsage,
        getFileUploadDtos,
        clearAllFiles
    };
};