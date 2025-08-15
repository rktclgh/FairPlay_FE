import React, {useEffect, useMemo, useRef, useState} from "react";
import {TopNav} from "../../components/TopNav";
import {HostSideNav} from "../../components/HostSideNav";
import {loadKakaoMap} from "../../lib/loadKakaoMap";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import {useFileUpload} from "../../hooks/useFileUpload";
import type {EventDetailResponseDto, EventDetailModificationRequestDto} from "../../services/types/eventType";
import { dashboardAPI } from "../../services/dashboard";
import {toast} from "react-toastify";
import {eventAPI} from "../../services/event";
import { businessAPI, BusinessVerificationRequest } from "../../services/business";

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

declare global {
    interface Window {
        kakao: any;
    }
}

interface KakaoPlace {
    id: string;
    place_name: string;
    address_name: string;
    road_address_name?: string;
    phone?: string;
    x?: string; // longitude
    y?: string; // latitude
}

interface ExternalLink {
    name: string;
    url: string;
}

export const EditEventInfo = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [eventData, setEventData] = useState<EventDetailResponseDto | null>(null);
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

    // 파일 선택
    const pickImageFile = () =>
        new Promise<File | null>((resolve) => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = () => resolve(input.files?.[0] ?? null);
            input.click();
        });

    // 에디터에 이미지 삽입
    const insertImage = (ref: React.RefObject<ReactQuill>, url: string) => {
        const quill = ref.current?.getEditor();
        if (!quill) return;
        const range = quill.getSelection(true) ?? { index: quill.getLength(), length: 0 };
        quill.insertEmbed(range.index, "image", url, "user");
        quill.setSelection(range.index + 1, 0, "user");
    };

    // 서버 업로드 → CDN URL
    const uploadEditorImageAndGetUrl = async (file: File) => {
        try {
            const uploaded: any = await uploadFile(file, "editor_image"); // tempFiles에 쌓임
            const key: string | undefined =
                uploaded?.key ??
                uploaded?.data?.key ??
                (Array.isArray(uploadedFiles) ? uploadedFiles[uploadedFiles.length - 1]?.key : undefined);
            if (!key) throw new Error("No key");
            return toCdnUrl(key);
        } catch {
            toast.error("이미지 업로드에 실패했습니다.");
            return null;
        }
    };

    // 이미지 버튼 핸들러가 포함된 모듈(메모이즈)
    const createModules = (ref: React.RefObject<ReactQuill>) =>
        ({
            toolbar: {
                container: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline"],
                    // 리스트/링크/이미지 버튼
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link", "image"],
                    ["clean"],
                ],
                handlers: {
                    image: async () => {
                        const file = await pickImageFile();
                        if (!file) return;
                        const url = await uploadEditorImageAndGetUrl(file);
                        if (url) insertImage(ref, url);
                    },
                },
            },
            clipboard: { matchVisual: false },
            history: { delay: 1000, maxStack: 100, userOnly: true },
        }) as const;

    // modules는 렌더마다 바뀌지 않게 고정
    const detailModules = useMemo(() => createModules(detailRef), []);
    const policyModules = useMemo(() => createModules(policyRef), []);
    const inquiryModules = useMemo(() => createModules(inquiryRef), []);

    const quillFormats = useMemo(
        () => ["header", "bold", "italic", "underline", "list", "bullet", "link", "image"],
        []
    );

    // 붙여넣기/드롭 이미지 업로드
    useEffect(() => {
        const bind = (ref: React.RefObject<ReactQuill>) => {
            const quill = ref.current?.getEditor();
            if (!quill) return () => {};
            const root = quill.root;

            const onPaste = async (e: ClipboardEvent) => {
                const items = Array.from(e.clipboardData?.items || []);
                const imgs = items.filter((i) => i.type.startsWith("image/"));
                if (imgs.length === 0) return;
                e.preventDefault();
                for (const it of imgs) {
                    const f = it.getAsFile();
                    if (!f) continue;
                    const url = await uploadEditorImageAndGetUrl(f);
                    if (url) insertImage(ref, url);
                }
            };

            const onDrop = async (e: DragEvent) => {
                const files = Array.from(e.dataTransfer?.files || []).filter((f) => f.type.startsWith("image/"));
                if (files.length === 0) return;
                e.preventDefault();
                for (const f of files) {
                    const url = await uploadEditorImageAndGetUrl(f);
                    if (url) insertImage(ref, url);
                }
            };

            const onDragOver = (e: DragEvent) => e.preventDefault();

            root.addEventListener("paste", onPaste as any);
            root.addEventListener("drop", onDrop as any);
            root.addEventListener("dragover", onDragOver as any);
            return () => {
                root.removeEventListener("paste", onPaste as any);
                root.removeEventListener("drop", onDrop as any);
                root.removeEventListener("dragover", onDragOver as any);
            };
        };

        const unbinders = [bind(detailRef), bind(policyRef), bind(inquiryRef)];
        return () => unbinders.forEach((u) => u && u());
        // 의도적으로 빈 deps: ref.current가 바뀌면 다음 렌더에서 다시 바인딩됨
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [formData, setFormData] = useState({
        eventId: null as number,
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
    const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);

    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchResults, setSearchResults] = useState<KakaoPlace[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const {
        uploadedFiles,
        isUploading,
        uploadFile,
        removeFile,
        getFileByUsage,
        getFileUploadDtos,
    } = useFileUpload();

    const [uploading, setUploading] = useState<'vertical' | 'horizontal' | null>(null);
    const [businessVerifying, setBusinessVerifying] = useState(false);
    const [businessVerified, setBusinessVerified] = useState<boolean | null>(null);

    const handleBannerUpload = async (file: File, usage: 'banner_vertical') => {
        if (!file) return;
        const type = 'vertical';
        setUploading(type);
        await uploadFile(file, usage);
        setUploading(null);
    };

    // Quill 에디터 설정
    const quillModules = {
        toolbar: [
            [{'header': [1, 2, 3, false]}],
            ['bold', 'italic', 'underline'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link', 'image'],
            ['clean']
        ],
    };

    // const quillFormats = [
    //     'header',
    //     'bold', 'italic', 'underline',
    //     'list', 'bullet',
    //     'link', 'image'
    // ];

    // 이벤트 데이터 로드
    useEffect(() => {
        fetchEventData();
    }, []);


    const fetchEventData = async () => {
        try {
            setLoading(true);
            const myEvent = await dashboardAPI.getMyEventWithDetails();
            if (myEvent) {
                console.log('로드된 이벤트 데이터:', myEvent);
                console.log('썸네일 URL:', myEvent.thumbnailUrl);
                console.log('배너 URL:', myEvent.bannerUrl);
                console.log('썸네일 URL에 tmp 포함여부:', myEvent.thumbnailUrl?.includes('/tmp') ? 'YES - tmp 파일입니다!' : 'NO - 정상 파일입니다');
                setEventData(myEvent);
                setFormData({
                    eventId: myEvent.eventId,
                    eventNameKr: myEvent.titleKr || "",
                    eventNameEn: myEvent.titleEng || "",
                    startDate: myEvent.startDate ? myEvent.startDate.split("T")[0] : "",
                    endDate: myEvent.endDate ? myEvent.endDate.split("T")[0] : "",
                    eventOutline: myEvent.bio || "",
                    eventDetail: myEvent.content || "",
                    viewingTime: myEvent.eventTime?.toString() || "",
                    viewingGrade: myEvent.age ? "청소년불가" : "전체이용가",
                    mainCategory: myEvent.mainCategory || "",
                    subCategory: myEvent.subCategory || "",
                    businessNumber: myEvent.managerBusinessNumber || "",
                    managerName: myEvent.managerName || "",
                    phone: myEvent.managerPhone || "",
                    email: myEvent.managerEmail || "",
                    registerId: "",
                    externalTicketName: "",
                    externalTicketUrl: "",
                    organizerName: "",
                    representativeName: myEvent.hostName || "",
                    contactInfo: myEvent.contactInfo || "",
                    organizerWebsite: myEvent.officialUrl
                        ? typeof myEvent.officialUrl === "string" &&
                        !myEvent.officialUrl.startsWith("[")
                            ? myEvent.officialUrl
                            : ""
                        : "",
                    hostCompany: myEvent.hostCompany || "",
                    policy: myEvent.policy || "",
                    reentryAllowed: myEvent.reentryAllowed ?? false,
                    exitScanRequired: myEvent.checkOutAllowed ?? false,
                    checkInRequired: myEvent.checkInAllowed ?? false,
                    address: myEvent.address || "",
                    detailAddress: myEvent.locationDetail || "",
                    placeUrl: myEvent.placeUrl,
                    placeName: myEvent.placeName || "",
                    longitude: myEvent.longitude || null,
                    latitude: myEvent.latitude || null,
                    organizerBusinessNumber: myEvent.managerBusinessNumber || ""
                });

                // 외부 링크 로드 (externalLinks 사용)
                if (myEvent.externalLinks && myEvent.externalLinks.length > 0) {
                    setExternalLinks(myEvent.externalLinks.map(link => ({
                        name: link.displayText || "",
                        url: link.url || ""
                    })));
                } else {
                    setExternalLinks([{name: "", url: ""}]);
                }

                if (myEvent.placeName) setSearchKeyword(myEvent.placeName);
            }
        } catch (error) {
            console.error("이벤트 데이터 로드 실패:", error);
            toast.error("이벤트 정보를 불러올 수 없습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 서브카테고리 매핑 (EventOverview.tsx와 동일)
    const getSubCategories = (mainCategory: string) => {
        const subCategories: Record<string, string[]> = {
            "박람회": [
                "취업/채용", "산업/기술", "유학/이민/해외취업", "프랜차이즈/창업",
                "뷰티/패션", "식품/음료", "반려동물", "교육/도서", "IT/전자", "스포츠/레저", "기타(박람회)"
            ],
            "강연/세미나": [
                "취업/진로", "창업/스타트업", "과학/기술", "자기계발/라이프스타일",
                "인문/문화/예술", "건강/의학", "기타(세미나)"
            ],
            "전시/행사": [
                "미술/디자인", "사진/영상", "공예/수공예", "패션/주얼리", "역사/문화",
                "체험 전시", "아동/가족", "행사/축제", "브랜드 프로모션", "기타(전시/행사)"
            ],
            "공연": [
                "콘서트", "연극/뮤지컬", "클래식/무용", "아동/가족(공연)", "기타(공연)"
            ],
            "축제": [
                "음악 축제", "영화 축제", "문화 축제", "음식 축제", "전통 축제", "지역 축제", "기타(축제)"
            ]
        };
        return subCategories[mainCategory] || [];
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value, type} = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        // 메인카테고리가 변경되면 서브카테고리 초기화
        if (name === "mainCategory") {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                subCategory: "" // 서브카테고리 초기화
            }));
        } else if (type === "checkbox") {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleLinkChange = (index: number, field: "name" | "url", value: string) => {
        const currentLinks = externalLinks.length > 0 ? externalLinks : [{name: "", url: ""}];
        const newLinks = [...currentLinks];
        newLinks[index][field] = value;
        setExternalLinks(newLinks);
    };

    const addLink = () => setExternalLinks([...externalLinks, {name: "", url: ""}]);

    const removeLink = (index: number) => {
        if (externalLinks.length > 0) {
            const newLinks = externalLinks.filter((_, i) => i !== index);
            setExternalLinks(newLinks);
        }
        // 빈 배열이 되어도 UI에서는 기본 입력칸이 하나 표시됨
    };

    // 카카오맵 장소 검색
    const searchPlaces = () => {
        if (!searchKeyword.trim()) {
            alert('장소명을 입력해주세요!');
            return;
        }

        loadKakaoMap(() => {
            if (!window.kakao?.maps?.services) {
                alert('카카오맵 서비스를 불러올 수 없습니다.');
                return;
            }

            const ps = new window.kakao.maps.services.Places();
            ps.keywordSearch(searchKeyword, (data: KakaoPlace[], status: string) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    setSearchResults(data);
                    setShowSearchResults(true);
                } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
                    alert('검색 결과가 없습니다.');
                    setSearchResults([]);
                    setShowSearchResults(false);
                } else {
                    alert('검색 중 오류가 발생했습니다.');
                    setSearchResults([]);
                    setShowSearchResults(false);
                }
            });
        });
    };

    // 장소 선택
    const selectPlace = (place: KakaoPlace) => {
        const preferredAddress = place.road_address_name || place.address_name;
        setFormData((prev) => ({
            ...prev,
            address: preferredAddress,
            placeName: place.place_name,
            detailAddress: "",
            longitude: place.x ? parseFloat(place.x) : null,
            latitude: place.y ? parseFloat(place.y) : null,
            placeUrl: `https://place.map.kakao.com/${place.id}`, // 카카오맵 장소 URL
        }));
        setSearchKeyword(place.place_name);
        setShowSearchResults(false);
    };

    // 사업자 번호 검증 함수
    const verifyBusinessNumber = async (businessNumber: string) => {
        if (!businessNumber || businessNumber.length !== 10) {
            return false;
        }

        setBusinessVerifying(true);
        try {
            const businessData: BusinessVerificationRequest = {
                businessNumber: businessNumber
            };

            const result = await businessAPI.verifyBusiness(businessData);
            setBusinessVerified(result.valid);
            
            if (result.valid) {
                toast.success("사업자 등록번호가 확인되었습니다.");
            } else {
                toast.error(result.message || "사업자 등록번호 검증에 실패했습니다.");
            }
            
            return result.valid;
        } catch (error) {
            console.error('사업자 번호 검증 실패:', error);
            setBusinessVerified(false);
            toast.error("사업자 번호 검증 중 오류가 발생했습니다.");
            return false;
        } finally {
            setBusinessVerifying(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!eventData) {
            toast.error("이벤트 정보를 찾을 수 없습니다.");
            return;
        }

        // 카테고리 ID 매핑
        const getCategoryIds = (mainCategory: string, subCategory: string) => {
            const mainCategoryMap: Record<string, number> = {
                박람회: 1,
                "강연/세미나": 2,
                "전시/행사": 3,
                공연: 4,
                축제: 5,
            };

            const subCategoryMap: Record<string, Record<string, number>> = {
                박람회: {
                    "취업/채용": 101,
                    "산업/기술": 102,
                    "유학/이민/해외취업": 103,
                    "프랜차이즈/창업": 104,
                    "뷰티/패션": 105,
                    "식품/음료": 106,
                    반려동물: 107,
                    "교육/도서": 108,
                    "IT/전자": 109,
                    "스포츠/레저": 110,
                    "기타(박람회)": 111,
                },
                "강연/세미나": {
                    "취업/진로": 201,
                    "창업/스타트업": 202,
                    "과학/기술": 203,
                    "자기계발/라이프스타일": 204,
                    "인문/문화/예술": 205,
                    "건강/의학": 206,
                    "기타(세미나)": 207,
                },
                "전시/행사": {
                    "미술/디자인": 301,
                    "사진/영상": 302,
                    "공예/수공예": 303,
                    "패션/주얼리": 304,
                    "역사/문화": 305,
                    "체험 전시": 306,
                    "아동/가족": 307,
                    "행사/축제": 308,
                    "브랜드 프로모션": 309,
                    "기타(전시/행사)": 310,
                },
                공연: {
                    콘서트: 401,
                    "연극/뮤지컬": 402,
                    "클래식/무용": 403,
                    "아동/가족(공연)": 404,
                    "기타(공연)": 405,
                },
                축제: {
                    "음악 축제": 501,
                    "영화 축제": 502,
                    "문화 축제": 503,
                    "음식 축제": 504,
                    "전통 축제": 505,
                    "지역 축제": 506,
                    "기타(축제)": 507,
                },
            };

            return {
                mainCategoryId: mainCategoryMap[mainCategory] || null,
                subCategoryId: subCategoryMap[mainCategory]?.[subCategory] || null,
            };
        };

        try {
            setSaving(true);

            // 사업자 번호가 변경되었는지 확인하고 검증
            const originalBusinessNumber = eventData.managerBusinessNumber || "";
            const newBusinessNumber = formData.organizerBusinessNumber;
            
            if (newBusinessNumber && newBusinessNumber !== originalBusinessNumber) {
                toast.info("사업자 등록번호가 변경되었습니다. 검증 중...");
                const isVerified = await verifyBusinessNumber(newBusinessNumber);
                if (!isVerified) {
                    setSaving(false);
                    return;
                }
            }

            const categoryIds = getCategoryIds(
                formData.mainCategory,
                formData.subCategory
            );

            // 업로드된 배너 이미지 URL 확인
            const bannerFile = getFileByUsage('banner_vertical');
            const thumbnailUrl = bannerFile ? toCdnUrl(bannerFile.key) : undefined;

            const modificationRequest: EventDetailModificationRequestDto = {
                titleKr: formData.eventNameKr || undefined,
                titleEng: formData.eventNameEn || undefined,
                address: formData.address || undefined,
                placeName: formData.placeName || undefined,
                latitude: formData.latitude || undefined,
                longitude: formData.longitude || undefined,
                locationDetail: formData.detailAddress || undefined,
                hostName: formData.representativeName || undefined,
                hostCompany: formData.hostCompany || undefined,
                contactInfo: formData.contactInfo || undefined,
                bio: formData.eventOutline || undefined,
                content: formData.eventDetail || undefined,
                policy: formData.policy || undefined,
                externalLinks: externalLinks.filter(l => l.url && l.url.trim() !== "").length > 0 ? externalLinks.filter((l) => l.url && l.url.trim() !== "").map(link => ({url: link.url, displayText: link.name})) : undefined,
                officialUrl: formData.organizerWebsite || undefined,
                eventTime: formData.viewingTime ? parseInt(formData.viewingTime) : undefined,
                startDate: formData.startDate || undefined,
                endDate: formData.endDate || undefined,
                mainCategoryId: categoryIds.mainCategoryId || undefined,
                subCategoryId: categoryIds.subCategoryId || undefined,
                reentryAllowed: formData.reentryAllowed,
                checkInAllowed: formData.checkInRequired,
                checkOutAllowed: formData.exitScanRequired,
                age: formData.viewingGrade === "청소년불가",
                businessNumber: formData.organizerBusinessNumber || undefined,
                verified: businessVerified,
                managerName: formData.managerName || undefined,
                managerPhone: formData.phone || undefined,
                managerEmail: formData.email || undefined,
                thumbnailUrl: thumbnailUrl,
                tempFiles: getFileUploadDtos(),
            };

            console.log('전송될 tempFiles:', getFileUploadDtos());
            console.log('설정된 thumbnailUrl:', thumbnailUrl);

            await eventAPI.createEventModificationRequest(
                eventData.eventId,
                modificationRequest
            );

            toast.success("행사 상세 정보 수정 요청이 제출되었습니다.");
            toast.info("관리자 승인 후 변경사항이 반영됩니다.");
        } catch (error) {
            console.error("이벤트 수정 요청 실패:", error);
            toast.error("수정 요청 제출에 실패했습니다.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] min-h-screen relative">
                    <TopNav/>
                    <HostSideNav className="!absolute !left-0 !top-[117px]"/>
                    <div className="absolute left-64 top-[195px] w-[949px] flex items-center justify-center h-96">
                        <div className="text-lg text-gray-500">데이터를 불러오는 중...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!eventData) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] min-h-screen relative">
                    <TopNav/>
                    <HostSideNav className="!absolute !left-0 !top-[117px]"/>
                    <div className="absolute left-64 top-[195px] w-[949px] flex items-center justify-center h-96">
                        <div className="text-lg text-gray-500">담당하는 이벤트가 없습니다.</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
        <style>{customCheckboxStyles}</style>
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav/>

                {/* 페이지 제목 */}
                <div
                    className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    행사 상세 정보
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]"/>

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">

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
                                        <label
                                            className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사명(국문)
                                        </label>
                                        <input
                                            type="text"
                                            name="eventNameKr"
                                            value={formData.eventNameKr}
                                            onChange={handleInputChange}
                                            placeholder="국문 행사명을 입력하세요"
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.eventNameKr ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    {/* 행사명(영문) */}
                                    <div>
                                        <label
                                            className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사명(영문)
                                        </label>
                                        <input
                                            type="text"
                                            name="eventNameEn"
                                            value={formData.eventNameEn}
                                            onChange={handleInputChange}
                                            placeholder="영문 행사명을 입력하세요"
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.eventNameEn ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    {/* 시작일 */}
                                    <div>
                                        <label
                                            className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            시작일
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.startDate ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    {/* 종료일 */}
                                    <div>
                                        <label
                                            className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            종료일
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.endDate ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    {/* 행사 장소 */}
                                    <div className="col-span-2">
                                        <label
                                            className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 장소
                                        </label>

                                        <div className="space-y-4">
                                            {/* 장소 검색 */}
                                            <div>
                                                <div className="relative w-1/2">
                                                    <input
                                                        type="text"
                                                        value={searchKeyword}
                                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                                        placeholder="장소명을 입력하세요"
                                                        className="w-full h-[40px] border border-gray-300 rounded-full px-4 pr-12 font-normal text-base outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                searchPlaces();
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={searchPlaces}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-gray-600 transition-colors w-16 h-12 flex items-center justify-center bg-transparent"
                                                    >
                                                        <svg className="w-10 h-10" fill="none" stroke="currentColor"
                                                             viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={2}
                                                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* 검색 결과 */}
                                                {showSearchResults && searchResults.length > 0 && (
                                                    <div
                                                        className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto mt-2">
                                                        {searchResults.map((place, index) => (
                                                            <div
                                                                key={index}
                                                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                                onClick={() => selectPlace(place)}
                                                            >
                                                                <div className="font-semibold text-gray-900">
                                                                    {place.place_name}
                                                                </div>
                                                                <div className="text-sm text-gray-600 mt-1">
                                                                    {place.road_address_name || place.address_name}
                                                                </div>
                                                                {place.road_address_name &&
                                                                    place.address_name !== place.road_address_name && (
                                                                        <div className="text-xs text-gray-400 mt-1">
                                                                            (지번: {place.address_name})
                                                                        </div>
                                                                    )}
                                                                {place.phone && (
                                                                    <div className="text-sm text-green-600 mt-1">
                                                                        {place.phone}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* 주소 */}
                                            <div>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    placeholder="기본 주소 (도로명 주소)"
                                                    readOnly
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-gray-100 outline-none text-left ${
                                                        formData.address
                                                            ? "text-black font-medium"
                                                            : "text-[#0000004c]"
                                                    }`}
                                                />
                                            </div>

                                            {/* 상세주소 */}
                                            <div>
                                                <input
                                                    type="text"
                                                    name="detailAddress"
                                                    value={formData.detailAddress}
                                                    onChange={handleInputChange}
                                                    placeholder="상세 주소"
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.detailAddress ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 카테고리 선택 */}
                                    <div className="col-span-2">
                                        <div className="grid grid-cols-2 gap-8">
                                            {/* 메인카테고리 */}
                                            <div>
                                                <label
                                                    className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    메인카테고리
                                                </label>
                                                <select
                                                    name="mainCategory"
                                                    value={formData.mainCategory || ""}
                                                    onChange={handleInputChange}
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.mainCategory ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                >
                                                    <option value="">메인카테고리를 선택하세요</option>
                                                    <option value="박람회">박람회</option>
                                                    <option value="강연/세미나">강연/세미나</option>
                                                    <option value="전시/행사">전시/행사</option>
                                                    <option value="공연">공연</option>
                                                    <option value="축제">축제</option>
                                                </select>
                                            </div>

                                            {/* 서브카테고리 */}
                                            <div>
                                                <label
                                                    className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    서브카테고리
                                                </label>
                                                <select
                                                    name="subCategory"
                                                    value={formData.subCategory || ""}
                                                    onChange={handleInputChange}
                                                    disabled={!formData.mainCategory}
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${!formData.mainCategory
                                                        ? 'text-gray-400 cursor-not-allowed'
                                                        : formData.subCategory
                                                            ? 'text-black font-medium'
                                                            : 'text-[#0000004c]'
                                                    }`}
                                                >
                                                    <option value="">
                                                        {!formData.mainCategory
                                                            ? "메인카테고리를 먼저 선택하세요"
                                                            : "서브카테고리를 선택하세요"
                                                        }
                                                    </option>
                                                    {formData.mainCategory && getSubCategories(formData.mainCategory).map((subCategory: string, index: number) => (
                                                        <option key={index} value={subCategory}>
                                                            {subCategory}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 행사 배너 이미지 */}
                                    {/* 세로형 배너 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 배너 (세로형)
                                        </label>
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors relative"
                                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-400', 'bg-blue-50'); }}
                                            onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50'); }}
                                            onDrop={async (e) => {
                                                e.preventDefault();
                                                e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                                                const file = e.dataTransfer.files?.[0];
                                                if (file) {
                                                    await handleBannerUpload(file, 'banner_vertical');
                                                }
                                            }}
                                        >
                                            {isUploading && uploading === 'vertical' && <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center"><div className="text-lg">업로드 중...</div></div>}
                                            {getFileByUsage('banner_vertical') ? (
                                                <div className="space-y-2">
                                                    <img
                                                        src={`${import.meta.env.VITE_CDN_BASE_URL}/${getFileByUsage('banner_vertical')?.key}`}
                                                        alt="세로형 배너 미리보기"
                                                        className="mx-auto max-h-48 max-w-full object-contain rounded"
                                                    />
                                                    <div className="text-sm text-gray-600 space-x-2">
                                                        <label htmlFor="banner-vertical-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                                            <span>이미지 변경</span>
                                                            <input id="banner-vertical-upload" type="file" accept="image/*" className="sr-only"
                                                                   onChange={async (e) => {
                                                                       const file = e.target.files?.[0];
                                                                       if (file) await handleBannerUpload(file, 'banner_vertical');
                                                                   }}
                                                            />
                                                        </label>
                                                        <button type="button" onClick={() => removeFile('banner_vertical')} className="font-medium text-red-600 hover:text-red-500">
                                                            삭제
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : eventData?.thumbnailUrl ? (
                                                <div className="space-y-2">
                                                    <p className="text-sm text-gray-500">현재 등록된 이미지</p>
                                                    <img
                                                        src={`${eventData.thumbnailUrl}?v=${Date.now()}`}
                                                        alt="현재 세로형 배너"
                                                        className="mx-auto max-h-48 max-w-full object-contain rounded"
                                                    />
                                                    <div className="text-sm text-gray-600">
                                                        <label htmlFor="banner-vertical-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                                            <span>이미지 변경</span>
                                                            <input id="banner-vertical-upload" type="file" accept="image/*" className="sr-only"
                                                                   onChange={async (e) => {
                                                                       const file = e.target.files?.[0];
                                                                       if (file) await handleBannerUpload(file, 'banner_vertical');
                                                                   }}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                    <div className="text-sm text-gray-600">
                                                        <label htmlFor="banner-vertical-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                                            <span>이미지 업로드</span>
                                                            <input id="banner-vertical-upload" type="file" accept="image/*" className="sr-only"
                                                                   onChange={async (e) => {
                                                                       const file = e.target.files?.[0];
                                                                       if (file) await handleBannerUpload(file, 'banner_vertical');
                                                                   }}
                                                            />
                                                        </label>
                                                        <p className="pl-1">또는 드래그 앤 드롭</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500">PNG, JPG, GIF 최대 5MB</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 행사 개요 */}
                                    <div className="col-span-2">
                                        <label
                                            className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            행사 개요 (최대 80자)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="eventOutline"
                                                value={formData.eventOutline || ""}
                                                onChange={handleInputChange}
                                                placeholder="행사 개요를 입력하세요"
                                                maxLength={80}
                                                className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.eventOutline ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                            />
                                            <div className="absolute right-0 bottom-1 text-xs text-gray-500">
                                                {(formData.eventOutline?.length || 0)}/80
                                            </div>
                                        </div>
                                    </div>

                                    {/* 상세 정보 */}
                                    <div className="col-span-2 mb-12">
                                        <label
                                            className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            상세 정보
                                        </label>
                                        <div>
                                            <ReactQuill
                                                ref={detailRef}
                                                theme="snow"
                                                value={formData.eventDetail || ""}
                                                onChange={(html) => setFormData((p)=> ({ ...p, eventDetail: html || "" }))}
                                                modules={detailModules}
                                                formats={quillFormats}
                                                placeholder="행사 상세 정보를 입력하세요"
                                                style={{height: '400px'}}
                                            />
                                        </div>
                                    </div>

                                    {/* 관람시간과 관람등급 */}
                                    <div className="col-span-2">
                                        <div className="grid grid-cols-2 gap-8">
                                            {/* 관람시간(분) */}
                                            <div>
                                                <label
                                                    className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    관람시간(분)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="viewingTime"
                                                    value={formData.viewingTime || ""}
                                                    onChange={handleInputChange}
                                                    placeholder="관람시간을 입력하세요"
                                                    min="30"
                                                    step="10"
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.viewingTime ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                />
                                            </div>

                                            {/* 관람등급 */}
                                            <div>
                                                <label
                                                    className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    관람등급
                                                </label>
                                                <select
                                                    name="viewingGrade"
                                                    value={formData.viewingGrade || ""}
                                                    onChange={handleInputChange}
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.viewingGrade ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                >
                                                    <option value="">관람등급을 선택하세요</option>
                                                    <option value="전체이용가">전체이용가</option>
                                                    <option value="청소년불가">청소년불가</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 입장/재입장/퇴장 스캔 설정 */}
                                    <div className="col-span-2">
                                        <div className="grid grid-cols-3 gap-6">
                                            {/* 체크인 허용 여부 */}
                                            <div>
                                                <label
                                                    className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    체크인 허용 여부
                                                </label>
                                                <div className="flex items-center h-[54px]">
                                                    <label className="custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            name="checkInRequired"
                                                            checked={formData.checkInRequired}
                                                            onChange={handleInputChange}
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
                                                <label
                                                    className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    재입장 허용 여부
                                                </label>
                                                <div className="flex items-center h-[54px]">
                                                    <label className="custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            name="reentryAllowed"
                                                            checked={formData.reentryAllowed}
                                                            onChange={handleInputChange}
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
                                                <label
                                                    className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                                    퇴장 스캔 여부
                                                </label>
                                                <div className="flex items-center h-[54px]">
                                                    <label className="custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            name="exitScanRequired"
                                                            checked={formData.exitScanRequired}
                                                            onChange={handleInputChange}
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
                                    <label
                                        className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                        예매/취소/환불 정책
                                    </label>
                                    <div>
                                        <ReactQuill
                                            ref={policyRef}
                                            theme="snow"
                                            value={formData.policy || ""}
                                            onChange={(html) => setFormData((p) => ({ ...p, policy: html || "" }))}
                                            modules={policyModules}
                                            formats={quillFormats}
                                            placeholder="예매, 취소, 환불 정책을 입력하세요"
                                            style={{height: "150px"}}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 외부 링크 섹션 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="font-bold text-black text-lg leading-[30px] mb-6">외부 링크</h2>
                                <button
                                    type="button"
                                    onClick={addLink}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm font-semibold mb-4"
                                >
                                    링크 추가
                                </button>
                                <div className="space-y-4">
                                    {(externalLinks.length > 0 ? externalLinks : [{name: "", url: ""}]).map((link, index) => (
                                        <div key={index} className="grid grid-cols-2 gap-8">
                                            <div>
                                                <label className="block text-[15px] font-bold mb-1">외부 티켓 사이트명</label>
                                                <input
                                                    type="text"
                                                    name="externalTicketName"
                                                    value={link.name}
                                                    onChange={(e) => handleLinkChange(index, "name", e.target.value)}
                                                    placeholder="예: 인터파크 티켓"
                                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${link.name ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                />
                                            </div>
                                            <div className="flex items-center">
                                                <div className="flex-grow">
                                                    <label className="block text-[15px] font-bold mb-1">외부 티켓 사이트 URL</label>
                                                    <input
                                                        type="text"
                                                        value={link.url}
                                                        onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                                                        placeholder="https://example.com"
                                                        className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${link.url ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeLink(index)}
                                                    className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                                                >
                                                    삭제
                                                </button>
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
                                        <label className="block text-[15px] font-bold mb-1">주최자명</label>
                                        <input
                                            type="text"
                                            name="representativeName"
                                            value={formData.representativeName}
                                            onChange={handleInputChange}
                                            placeholder="대표자명을 입력하세요"
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.representativeName ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[15px] font-bold mb-1">
                                            사업자 등록번호
                                            {businessVerified === true && (
                                                <span className="ml-2 text-sm text-green-600">✓ 확인됨</span>
                                            )}
                                            {businessVerified === false && (
                                                <span className="ml-2 text-sm text-red-600">✗ 검증 실패</span>
                                            )}
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                name="organizerBusinessNumber"
                                                value={formData.organizerBusinessNumber}
                                                onChange={(e) => {
                                                    handleInputChange(e);
                                                    setBusinessVerified(null); // 입력 시 검증 상태 초기화
                                                }}
                                                placeholder="0000000000"
                                                maxLength={10}
                                                className={`flex-1 h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.organizerBusinessNumber ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => verifyBusinessNumber(formData.organizerBusinessNumber)}
                                                disabled={businessVerifying || !formData.organizerBusinessNumber || formData.organizerBusinessNumber.length !== 10}
                                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                                            >
                                                {businessVerifying ? '검증 중...' : '검증'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <label className="block text-[15px] font-bold mb-1">주최/기획사</label>
                                    <input
                                        type="text"
                                        name="hostCompany"
                                        value={formData.hostCompany}
                                        onChange={handleInputChange}
                                        placeholder="주최/기획사명을 입력하세요"
                                        className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${
                                            formData.hostCompany
                                                ? "text-black font-medium"
                                                : "text-[#0000004c]"
                                        }`}
                                    />
                                </div>
                                <div className="mt-6">
                                    <label className="block text-[15px] font-bold mb-1">공식 웹사이트 URL</label>
                                    <input
                                        type="text"
                                        name="organizerWebsite"
                                        value={formData.organizerWebsite}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com"
                                        className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.organizerWebsite ? 'text-black font-medium' : 'text-[#0000004c]'}`}
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
                                        <label
                                            className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">담당자명</label>
                                        <input
                                            type="text"
                                            name="managerName"
                                            value={formData.managerName}
                                            onChange={handleInputChange}
                                            placeholder="담당자명을 입력하세요"
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.managerName ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    <div>
                                        <label
                                            className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">연락처</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="010-0000-0000"
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.phone ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                    <div>
                                        <label
                                            className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">이메일</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="담당자 이메일을 입력하세요"
                                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.email ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 문의처 섹션 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="font-bold text-black text-lg leading-[30px] mb-6">문의처</h2>
                                <div className="mb-12">
                                    <label
                                        className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                        상세정보
                                    </label>
                                    <div>
                                        <ReactQuill
                                            ref={inquiryRef}
                                            theme="snow"
                                            value={formData.contactInfo || ""}
                                            onChange={(html) => setFormData((p) => ({ ...p, contactInfo: html || "" }))}
                                            modules={inquiryModules}
                                            formats={quillFormats}
                                            placeholder="문의처 상세정보를 입력하세요 (문의시간, 추가 연락처, 주의사항 등)"
                                            style={{height: "150px"}}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 폼 컨테이너 끝 */}
                        <div className="flex flex-col items-center space-y-4 mt-8">
                            <button
                                onClick={handleSubmit}
                                disabled={saving || !formData.eventNameKr || !formData.eventNameEn}
                                className={`px-6 py-2 rounded-[10px] transition-colors text-sm 
                    ${saving
                                ? "bg-gray-400 text-white cursor-not-allowed"
                                : formData.eventNameKr && formData.eventNameEn
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : 'bg-gray-400 text-white cursor-not-allowed'
                            }`}
                            >
                                {saving ? "저장 중..." : "행사 상세 정보 수정"}
                            </button>
                            <p className="text-sm text-gray-500 text-center">
                                수정 요청 후 관리자 승인이 완료되면 변경사항이 반영됩니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};