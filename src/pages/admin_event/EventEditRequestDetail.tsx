import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";
import { modificationRequestAPI, ModificationRequestDetail, ModificationApprovalRequest } from '../../services/modificationRequest';
import { toast } from 'react-toastify';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// 커스텀 체크박스 스타일
const customCheckboxStyles = `
.custom-checkbox {
  position: relative;
  display: inline-block;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: #fff;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.custom-checkbox:hover .checkmark {
  border-color: #3b82f6;
}

.custom-checkbox input:checked ~ .checkmark {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.custom-checkbox input:checked ~ .checkmark:after {
  display: block;
}
`;

interface ExternalLink {
    name: string;
    url: string;
}

export const EventEditRequestDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // 상태 관리
    const [requestDetail, setRequestDetail] = useState<ModificationRequestDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [processing, setProcessing] = useState<boolean>(false);
    const [adminComment, setAdminComment] = useState<string>('');

    // 폼 데이터 상태 (EditEventInfo.tsx와 동일한 구조)
    const [formData, setFormData] = useState({
        eventId: null as number | null,
        eventNameKr: "",
        eventNameEn: "",
        startDate: "",
        endDate: "",
        address: "",
        detailAddress: "",
        eventOutline: "",
        eventDetail: "",
        viewingTime: "",
        viewingGrade: "",
        mainCategory: "",
        subCategory: "",
        businessNumber: "",
        managerName: "",
        phone: "",
        email: "",
        registerId: "",
        externalTicketName: "",
        externalTicketUrl: "",
        organizerName: "",
        representativeName: "",
        contactInfo: "",
        organizerWebsite: "",
        hostCompany: "",
        policy: "",
        reentryAllowed: false,
        exitScanRequired: false,
        checkInRequired: false,
        // 카카오맵에서 받은 장소 정보
        placeName: "",
        latitude: null as number | null,
        longitude: null as number | null,
        placeUrl: "",
        organizerBusinessNumber: "",
    });
    const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([
        {name: "", url: ""},
    ]);
    
    const detailRef = useRef<ReactQuill | null>(null);
    const policyRef = useRef<ReactQuill | null>(null);
    const inquiryRef = useRef<ReactQuill | null>(null);

    // CDN URL 생성 유틸
    const toCdnUrl = (path: string) => {
        const base = import.meta.env.VITE_CDN_BASE_URL || "";
        if (/^https?:\/\//.test(path)) return path;
        const clean = path.startsWith("/") ? path.slice(1) : path;
        return `${base}/${clean}`;
    };

    // Quill 에디터 설정 (읽기 전용)
    const createModules = (readOnly = true) => ({
        toolbar: readOnly ? false : [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],
        ],
    });

    const detailModules = useMemo(() => createModules(true), []);
    const policyModules = useMemo(() => createModules(true), []);
    const inquiryModules = useMemo(() => createModules(true), []);

    const quillFormats = useMemo(
        () => ["header", "bold", "italic", "underline", "list", "bullet", "link", "image"],
        []
    );

    // 카테고리 매핑
    const getCategoryName = (categoryId: number | null | undefined, isMain: boolean = true): string => {
        if (!categoryId) return "";
        
        if (isMain) {
            const mainCategoryMap: Record<number, string> = {
                1: "박람회",
                2: "강연/세미나", 
                3: "전시/행사",
                4: "공연",
                5: "축제"
            };
            return mainCategoryMap[categoryId] || "";
        } else {
            const subCategoryMap: Record<number, string> = {
                101: "취업/채용", 102: "산업/기술", 103: "유학/이민/해외취업", 104: "프랜차이즈/창업",
                105: "뷰티/패션", 106: "식품/음료", 107: "반려동물", 108: "교육/도서", 
                109: "IT/전자", 110: "스포츠/레저", 111: "기타(박람회)",
                201: "취업/진로", 202: "창업/스타트업", 203: "과학/기술", 204: "자기계발/라이프스타일",
                205: "인문/문화/예술", 206: "건강/의학", 207: "기타(세미나)",
                301: "미술/디자인", 302: "사진/영상", 303: "공예/수공예", 304: "패션/주얼리",
                305: "역사/문화", 306: "체험 전시", 307: "아동/가족", 308: "행사/축제",
                309: "브랜드 프로모션", 310: "기타(전시/행사)",
                401: "콘서트", 402: "연극/뮤지컬", 403: "클래식/무용", 404: "아동/가족(공연)", 405: "기타(공연)",
                501: "음악 축제", 502: "영화 축제", 503: "문화 축제", 504: "음식 축제", 
                505: "전통 축제", 506: "지역 축제", 507: "기타(축제)"
            };
            return subCategoryMap[categoryId] || "";
        }
    };

    // 필드가 수정되었는지 확인하는 함수
    const isFieldModified = (fieldName: string, originalValue: any, modifiedValue: any): boolean => {
        if (!requestDetail) return false;
        
        // null, undefined, 빈 문자열을 모두 같은 것으로 취급하여 정규화
        const normalizeValue = (val: any) => {
            if (val === null || val === undefined || val === "") return null;
            if (typeof val === 'boolean') return val;
            if (typeof val === 'number') return val;
            return String(val);
        };
        
        const normalizedOriginal = normalizeValue(originalValue);
        const normalizedModified = normalizeValue(modifiedValue);
        
        // modifiedData에 해당 필드가 실제로 있고, 원본과 다른 값인 경우에만 수정됨으로 간주
        const modifiedData = requestDetail.modifiedData;
        const fieldExistsInModified = modifiedData && fieldName in modifiedData && modifiedData[fieldName] !== null && modifiedData[fieldName] !== undefined;
        
        if (!fieldExistsInModified) return false;
        
        return normalizedOriginal !== normalizedModified;
    };

    // 데이터 로드
    useEffect(() => {
        fetchRequestDetail();
    }, [id]);

    const fetchRequestDetail = async () => {
        try {
            setLoading(true);
            const data = await modificationRequestAPI.getModificationRequestDetail(Number(id));
            setRequestDetail(data);
            
            // 디버깅용 로그
            console.log('Original Data:', data.originalData);
            console.log('Modified Data:', data.modifiedData);
            console.log('BusinessNumber - Original:', data.originalData.businessNumber, 'Modified:', data.modifiedData.businessNumber);
            console.log('ManagerName - Original:', data.originalData.managerName, 'Modified:', data.modifiedData.managerName);
            console.log('ManagerPhone - Original:', data.originalData.managerPhone, 'Modified:', data.modifiedData.managerPhone);
            console.log('ManagerEmail - Original:', data.originalData.managerEmail, 'Modified:', data.modifiedData.managerEmail);
            console.log('ContactInfo - Original:', data.originalData.contactInfo, 'Modified:', data.modifiedData.contactInfo);
            console.log('ExternalLinks - Original:', data.originalData.externalLinks, 'Modified:', data.modifiedData.externalLinks);
            
            // 폼 데이터 매핑
            const originalData = data.originalData;
            const modifiedData = data.modifiedData;
            
            setFormData({
                eventId: data.eventId,
                eventNameKr: modifiedData.titleKr || originalData.titleKr || "",
                eventNameEn: modifiedData.titleEng || originalData.titleEng || "",
                startDate: (modifiedData.startDate || originalData.startDate || "").split("T")[0],
                endDate: (modifiedData.endDate || originalData.endDate || "").split("T")[0],
                address: modifiedData.address || originalData.address || "",
                detailAddress: modifiedData.locationDetail || originalData.locationDetail || "",
                eventOutline: modifiedData.bio || originalData.bio || "",
                eventDetail: modifiedData.content || originalData.content || "",
                viewingTime: (modifiedData.eventTime || originalData.eventTime || "").toString(),
                viewingGrade: (modifiedData.age !== undefined ? modifiedData.age : originalData.age) ? "청소년불가" : "전체이용가",
                mainCategory: getCategoryName(modifiedData.mainCategoryId || originalData.mainCategoryId),
                subCategory: getCategoryName(modifiedData.subCategoryId || originalData.subCategoryId, false),
                businessNumber: modifiedData.businessNumber || originalData.businessNumber || "",
                managerName: modifiedData.managerName || originalData.managerName || "",
                phone: modifiedData.managerPhone || originalData.managerPhone || "",
                email: modifiedData.managerEmail || originalData.managerEmail || "",
                registerId: "",
                externalTicketName: "",
                externalTicketUrl: "",
                organizerName: "",
                representativeName: modifiedData.hostName || originalData.hostName || "",
                contactInfo: modifiedData.contactInfo || originalData.contactInfo || "",
                organizerWebsite: modifiedData.officialUrl || originalData.officialUrl || "",
                hostCompany: modifiedData.hostCompany || originalData.hostCompany || "",
                policy: modifiedData.policy || originalData.policy || "",
                reentryAllowed: modifiedData.reentryAllowed !== undefined ? modifiedData.reentryAllowed : originalData.reentryAllowed || false,
                exitScanRequired: modifiedData.checkOutAllowed !== undefined ? modifiedData.checkOutAllowed : originalData.checkOutAllowed || false,
                checkInRequired: modifiedData.checkInAllowed !== undefined ? modifiedData.checkInAllowed : originalData.checkInAllowed || false,
                placeName: modifiedData.placeName || originalData.placeName || "",
                latitude: modifiedData.latitude || originalData.latitude || null,
                longitude: modifiedData.longitude || originalData.longitude || null,
                placeUrl: modifiedData.placeUrl || originalData.placeUrl || "",
                organizerBusinessNumber: modifiedData.businessNumber || originalData.businessNumber || "",
            });

            // 외부 링크 처리 - modifiedData와 originalData에서 externalLinks 필드 사용
            const modifiedLinks = modifiedData.externalLinks || [];
            const originalLinks = originalData.externalLinks || [];
            
            // 수정된 링크가 있으면 사용, 없으면 원본 사용
            const linksToShow = modifiedLinks.length > 0 ? modifiedLinks : originalLinks;
            
            const externalLinksData = linksToShow.map(link => ({
                name: link.displayText || "외부 사이트", 
                url: link.url
            }));
            
            setExternalLinks(externalLinksData);
            
        } catch (error) {
            console.error('수정 요청 상세 조회 실패:', error);
            toast.error('수정 요청 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 승인/반려 처리
    const handleApproval = async (action: 'approve' | 'reject') => {
        if (!requestDetail) return;
        
        if (!adminComment.trim()) {
            toast.error('관리자 코멘트를 입력해주세요.');
            return;
        }

        try {
            setProcessing(true);
            
            const approvalRequest: ModificationApprovalRequest = {
                action,
                adminComment: adminComment.trim()
            };

            await modificationRequestAPI.processModificationRequest(requestDetail.requestId, approvalRequest);
            
            toast.success(action === 'approve' ? '수정 요청이 승인되었습니다.' : '수정 요청이 반려되었습니다.');
            navigate('/admin_dashboard/event-edit-requests');
            
        } catch (error) {
            console.error('수정 요청 처리 실패:', error);
            toast.error('수정 요청 처리에 실패했습니다.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] min-h-screen relative">
                    <TopNav />
                    <AdminSideNav className="!absolute !left-0 !top-[117px]" />
                    <div className="absolute left-64 top-[195px] w-[949px] flex items-center justify-center h-96">
                        <div className="text-lg text-gray-500">데이터를 불러오는 중...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!requestDetail) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] min-h-screen relative">
                    <TopNav />
                    <AdminSideNav className="!absolute !left-0 !top-[117px]" />
                    <div className="absolute left-64 top-[195px] w-[949px] flex items-center justify-center h-96">
                        <div className="text-lg text-gray-500">수정 요청을 찾을 수 없습니다.</div>
                    </div>
                </div>
            </div>
        );
    }

    const originalData = requestDetail.originalData;
    const modifiedData = requestDetail.modifiedData;

    return (
        <>
        <style>{customCheckboxStyles}</style>
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav/>

                {/* 페이지 제목 */}
                <div
                    className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    행사 상세 수정 요청 - {requestDetail.eventTitle}
                </div>

                {/* 사이드바 */}
                <AdminSideNav className="!absolute !left-0 !top-[117px]"/>

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">

                    {/* 요청 정보 헤더 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-lg">요청 정보</h2>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                requestDetail.statusCode === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                requestDetail.statusCode === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {requestDetail.statusName}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong>요청자 ID:</strong> {requestDetail.requestedBy}</div>
                            <div><strong>요청일:</strong> {new Date(requestDetail.createdAt).toLocaleDateString()}</div>
                            {requestDetail.adminComment && (
                                <div className="col-span-2">
                                    <strong>관리자 코멘트:</strong> {requestDetail.adminComment}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 폼 컨테이너 시작 */}
                    <div className="bg-white">
                        {/* 행사 정보 섹션 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">
                                    행사 정보
                                </h2>
                                <div className="grid grid-cols-2 gap-8">
                                    {/* 행사명(국문) */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사명(국문)
                                            {isFieldModified('titleKr', originalData.titleKr, modifiedData.titleKr) && 
                                                <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                            }
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.eventNameKr}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-50 outline-none text-left ${formData.eventNameKr ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    {/* 행사명(영문) */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사명(영문)
                                            {isFieldModified('titleEng', originalData.titleEng, modifiedData.titleEng) && 
                                                <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                            }
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.eventNameEn}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-50 outline-none text-left ${formData.eventNameEn ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    {/* 시작일 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            시작일
                                            {isFieldModified('startDate', originalData.startDate, modifiedData.startDate) && 
                                                <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                            }
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-50 outline-none text-left ${formData.startDate ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    {/* 종료일 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            종료일
                                            {isFieldModified('endDate', originalData.endDate, modifiedData.endDate) && 
                                                <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                            }
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-50 outline-none text-left ${formData.endDate ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    {/* 행사 장소 */}
                                    <div className="col-span-2">
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 장소
                                            {(isFieldModified('address', originalData.address, modifiedData.address) ||
                                              isFieldModified('placeName', originalData.placeName, modifiedData.placeName) ||
                                              isFieldModified('locationDetail', originalData.locationDetail, modifiedData.locationDetail)) && 
                                                <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                            }
                                        </label>

                                        <div className="space-y-4">
                                            {/* 장소명 */}
                                            <div>
                                                <input
                                                    type="text"
                                                    value={formData.placeName}
                                                    placeholder="장소명"
                                                    readOnly
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-50 outline-none text-left ${
                                                        formData.placeName ? "text-black font-medium" : "text-[#0000004c]"
                                                    }`}
                                                />
                                            </div>

                                            {/* 주소 */}
                                            <div>
                                                <input
                                                    type="text"
                                                    value={formData.address}
                                                    placeholder="기본 주소 (도로명 주소)"
                                                    readOnly
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-50 outline-none text-left ${
                                                        formData.address ? "text-black font-medium" : "text-[#0000004c]"
                                                    }`}
                                                />
                                            </div>

                                            {/* 상세주소 */}
                                            <div>
                                                <input
                                                    type="text"
                                                    value={formData.detailAddress}
                                                    placeholder="상세 주소"
                                                    readOnly
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-50 outline-none text-left ${formData.detailAddress ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 카테고리 선택 */}
                                    <div className="col-span-2">
                                        <div className="grid grid-cols-2 gap-8">
                                            {/* 메인카테고리 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    메인카테고리
                                                    {isFieldModified('mainCategoryId', originalData.mainCategoryId, modifiedData.mainCategoryId) && 
                                                        <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                                    }
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.mainCategory}
                                                    readOnly
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-50 outline-none text-left ${formData.mainCategory ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                />
                                            </div>

                                            {/* 서브카테고리 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    서브카테고리
                                                    {isFieldModified('subCategoryId', originalData.subCategoryId, modifiedData.subCategoryId) && 
                                                        <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                                    }
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.subCategory}
                                                    readOnly
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-50 outline-none text-left ${formData.subCategory ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 행사 배너 이미지 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 배너 (세로형)
                                            {isFieldModified('thumbnailUrl', originalData.thumbnailUrl, modifiedData.thumbnailUrl) && 
                                                <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                            }
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                                            {(modifiedData.bannerUrl || modifiedData.thumbnailUrl || originalData.bannerUrl || originalData.thumbnailUrl) ? (
                                                <div className="space-y-2">
                                                    <img
                                                        src={modifiedData.bannerUrl || modifiedData.thumbnailUrl || originalData.bannerUrl || originalData.thumbnailUrl}
                                                        alt="행사 배너"
                                                        className="mx-auto max-h-48 max-w-full object-contain rounded"
                                                    />
                                                    <div className="text-sm text-gray-600">
                                                        현재 등록된 배너 이미지
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500">등록된 배너 이미지가 없습니다.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 행사 개요 */}
                                    <div className="col-span-2">
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 개요 (최대 80자)
                                            {isFieldModified('bio', originalData.bio, modifiedData.bio) && 
                                                <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                            }
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.eventOutline || ""}
                                                readOnly
                                                className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-50 outline-none text-left ${formData.eventOutline ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                            />
                                            <div className="absolute right-0 bottom-1 text-xs text-gray-500">
                                                {(formData.eventOutline?.length || 0)}/80
                                            </div>
                                        </div>
                                    </div>

                                    {/* 상세 정보 */}
                                    <div className="col-span-2 mb-12">
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            상세 정보
                                            {isFieldModified('content', originalData.content, modifiedData.content) && 
                                                <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                            }
                                        </label>
                                        <div>
                                            <ReactQuill
                                                ref={detailRef}
                                                theme="snow"
                                                value={formData.eventDetail || ""}
                                                readOnly={true}
                                                modules={detailModules}
                                                formats={quillFormats}
                                                style={{height: '400px'}}
                                            />
                                        </div>
                                    </div>

                                    {/* 관람시간과 관람등급 */}
                                    <div className="col-span-2">
                                        <div className="grid grid-cols-2 gap-8">
                                            {/* 관람시간(분) */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    관람시간(분)
                                                    {isFieldModified('eventTime', originalData.eventTime, modifiedData.eventTime) && 
                                                        <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                                    }
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.viewingTime || ""}
                                                    readOnly
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-50 outline-none text-left ${formData.viewingTime ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                />
                                            </div>

                                            {/* 관람등급 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    관람등급
                                                    {isFieldModified('age', originalData.age, modifiedData.age) && 
                                                        <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                                    }
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.viewingGrade || ""}
                                                    readOnly
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-50 outline-none text-left ${formData.viewingGrade ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 입장/재입장/퇴장 스캔 설정 */}
                                    <div className="col-span-2">
                                        <div className="grid grid-cols-3 gap-6">
                                            {/* 체크인 허용 여부 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    체크인 허용 여부
                                                    {isFieldModified('checkInAllowed', originalData.checkInAllowed, modifiedData.checkInAllowed) && 
                                                        <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                                    }
                                                </label>
                                                <div className="flex items-center h-[54px]">
                                                    <label className="custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.checkInRequired}
                                                            disabled
                                                        />
                                                        <span className="checkmark"></span>
                                                    </label>
                                                    <span className="ml-3 text-sm font-medium text-gray-700">
                                                        체크인 허용
                                                    </span>
                                                </div>
                                            </div>

                                            {/* 재입장 허용 여부 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    재입장 허용 여부
                                                    {isFieldModified('reentryAllowed', originalData.reentryAllowed, modifiedData.reentryAllowed) && 
                                                        <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                                    }
                                                </label>
                                                <div className="flex items-center h-[54px]">
                                                    <label className="custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.reentryAllowed}
                                                            disabled
                                                        />
                                                        <span className="checkmark"></span>
                                                    </label>
                                                    <span className="ml-3 text-sm font-medium text-gray-700">
                                                        재입장 허용
                                                    </span>
                                                </div>
                                            </div>

                                            {/* 퇴장 스캔 여부 */}
                                            <div>
                                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    퇴장 스캔 여부
                                                    {isFieldModified('checkOutAllowed', originalData.checkOutAllowed, modifiedData.checkOutAllowed) && 
                                                        <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                                    }
                                                </label>
                                                <div className="flex items-center h-[54px]">
                                                    <label className="custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.exitScanRequired}
                                                            disabled
                                                        />
                                                        <span className="checkmark"></span>
                                                    </label>
                                                    <span className="ml-3 text-sm font-medium text-gray-700">
                                                        퇴장 시 스캔 필수
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 정책 섹션 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="col-span-2 mb-12">
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                        예매/취소/환불 정책
                                        {isFieldModified('policy', originalData.policy, modifiedData.policy) && 
                                            <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                        }
                                    </label>
                                    <div>
                                        <ReactQuill
                                            ref={policyRef}
                                            theme="snow"
                                            value={formData.policy || ""}
                                            readOnly={true}
                                            modules={policyModules}
                                            formats={quillFormats}
                                            style={{height: "150px"}}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 외부 링크 섹션 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="font-bold text-black text-lg leading-[30px] mb-6">
                                    외부 링크
                                    {isFieldModified('officialUrl', originalData.officialUrl, modifiedData.officialUrl) && 
                                        <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                    }
                                </h2>
                                <div className="space-y-4">
                                    {externalLinks.map((link, index) => (
                                        <div key={index} className="grid grid-cols-2 gap-8">
                                            <div>
                                                <label className="block text-[15px] font-bold mb-1">외부 티켓 사이트명</label>
                                                <input
                                                    type="text"
                                                    value={link.name}
                                                    readOnly
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-50 outline-none text-left ${link.name ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[15px] font-bold mb-1">외부 티켓 사이트 URL</label>
                                                <input
                                                    type="text"
                                                    value={link.url}
                                                    readOnly
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-50 outline-none text-left ${link.url ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 주최자 정보 섹션 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="font-bold text-black text-lg leading-[30px] mb-6">주최자 정보</h2>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">
                                            주최자명
                                            {isFieldModified('hostName', originalData.hostName, modifiedData.hostName) && 
                                                <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                            }
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.representativeName}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-50 outline-none text-left ${formData.representativeName ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">
                                            사업자 등록번호
                                            {isFieldModified('businessNumber', originalData.businessNumber, modifiedData.businessNumber) && 
                                                <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                            }
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.organizerBusinessNumber}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-50 outline-none text-left ${formData.organizerBusinessNumber ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <label className="block text-[15px] font-bold mb-1">
                                        주최/기획사
                                        {isFieldModified('hostCompany', originalData.hostCompany, modifiedData.hostCompany) && 
                                            <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                        }
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.hostCompany}
                                        readOnly
                                        className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-50 outline-none text-left ${
                                            formData.hostCompany ? "text-black font-medium" : "text-[#0000004c]"
                                        }`}
                                    />
                                </div>
                                <div className="mt-6">
                                    <label className="block text-[15px] font-bold mb-1">공식 웹사이트 URL</label>
                                    <input
                                        type="text"
                                        value={formData.organizerWebsite}
                                        readOnly
                                        className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-50 outline-none text-left ${formData.organizerWebsite ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 담당자 정보 섹션 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">담당자 정보</h2>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            담당자명
                                            {isFieldModified('managerName', originalData.managerName, modifiedData.managerName) && 
                                                <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                            }
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.managerName}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-50 outline-none text-left ${formData.managerName ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            연락처
                                            {isFieldModified('managerPhone', originalData.managerPhone, modifiedData.managerPhone) && 
                                                <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                            }
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-50 outline-none text-left ${formData.phone ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            이메일
                                            {isFieldModified('managerEmail', originalData.managerEmail, modifiedData.managerEmail) && 
                                                <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                            }
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            readOnly
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-50 outline-none text-left ${formData.email ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 문의처 섹션 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="font-bold text-black text-lg leading-[30px] mb-6">
                                    문의처
                                    {isFieldModified('contactInfo', originalData.contactInfo, modifiedData.contactInfo) && 
                                        <span className="ml-2 text-sm text-blue-600 font-medium">수정됨</span>
                                    }
                                </h2>
                                <div className="mb-12">
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                        상세정보
                                    </label>
                                    <div>
                                        <ReactQuill
                                            ref={inquiryRef}
                                            theme="snow"
                                            value={formData.contactInfo || ""}
                                            readOnly={true}
                                            modules={inquiryModules}
                                            formats={quillFormats}
                                            style={{height: "150px"}}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 관리자 처리 섹션 */}
                        {requestDetail.statusCode === 'PENDING' && (
                            <div className="mb-8">
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h2 className="font-bold text-black text-lg leading-[30px] mb-6">관리자 검토</h2>
                                    
                                    <div className="mb-4">
                                        <label className="block text-[15px] font-bold mb-1">관리자 코멘트</label>
                                        <textarea
                                            value={adminComment}
                                            onChange={(e) => setAdminComment(e.target.value)}
                                            placeholder="승인/반려 사유를 입력하세요"
                                            rows={4}
                                            className="w-full border border-gray-300 rounded-lg p-3 resize-none"
                                        />
                                    </div>
                                    
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={() => handleApproval('approve')}
                                            disabled={processing || !adminComment.trim()}
                                            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {processing ? '처리 중...' : '승인'}
                                        </button>
                                        <button
                                            onClick={() => handleApproval('reject')}
                                            disabled={processing || !adminComment.trim()}
                                            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {processing ? '처리 중...' : '반려'}
                                        </button>
                                        <button
                                            onClick={() => navigate('/admin_dashboard/event-edit-requests')}
                                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                        >
                                            목록으로 돌아가기
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 이미 처리된 요청의 경우 목록 버튼만 표시 */}
                        {requestDetail.statusCode !== 'PENDING' && (
                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={() => navigate('/admin_dashboard/event-edit-requests')}
                                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                >
                                    목록으로 돌아가기
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default EventEditRequestDetail;