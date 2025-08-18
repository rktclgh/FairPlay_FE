import { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { useParams, useNavigate } from "react-router-dom";

interface BoothParticipantDetailData {
    id: number;
    participateNumber: string;
    participateDate: string;
    startDate: string;
    endDate: string;
    boothName: string;
    boothType: string;
    representativeName: string;
    email: string;
    contact: string;
    website: string;
    websiteName?: string;
    externalTicketUrl?: string;
    bannerImageUrl?: string;
    description: string;
    zone: string;
}

const BoothParticipantDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [detail, setDetail] = useState<BoothParticipantDetailData>({
        id: Number(id) || 1,
        participateNumber: "PART-2024-001",
        participateDate: "2024.12.10 14:30",
        startDate: "2024.12.20",
        endDate: "2024.12.22",
        boothName: "FoodTech 스타트업 부스",
        boothType: "스탠다드 부스",
        representativeName: "김민수",
        email: "kimminsu@example.com",
        contact: "010-1234-5678",
        website: "https://foodtech-startup.com",
        websiteName: "FoodTech 공식 사이트",
        externalTicketUrl: "https://www.techbooth.co.kr",
        bannerImageUrl: "https://picsum.photos/seed/boothp/600/600",
        description: "승인된 참가 부스의 소개 텍스트입니다. 실제로는 신청 데이터에서 승인 시점의 정보를 복제/동기화하여 노출합니다.",
        zone: "A-01",
    });

    const [zoneInput, setZoneInput] = useState<string>("A-01");

    const handleBackToList = () => navigate("/host/booth-participants");
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
    const performDelete = () => {
        try {
            const key = 'deletedBoothParticipantIds';
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            const next = Array.from(new Set([...(Array.isArray(existing) ? existing : []), detail.id]));
            localStorage.setItem(key, JSON.stringify(next));
        } catch { }
        navigate("/host/booth-participants");
    };
    const handleSetZone = () => {
        const trimmed = zoneInput.trim();
        if (!trimmed) return;
        setDetail(prev => ({ ...prev, zone: trimmed }));
        try {
            const key = 'boothZoneById';
            const existing = JSON.parse(localStorage.getItem(key) || '{}');
            const next = { ...(existing && typeof existing === 'object' ? existing : {}), [String(detail.id)]: trimmed };
            localStorage.setItem(key, JSON.stringify(next));
        } catch { }
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-auto relative min-h-screen">
                <TopNav />

                {/* 페이지 제목: 부스명 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    {detail.boothName}
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="ml-64 mt-[195px] w-[949px] pb-24">
                    <div className="bg-white">
                        {/* 기본 정보 섹션 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">기본 정보</h2>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">참가 일정 시작일</label>
                                        <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}>
                                            <span>{detail.startDate}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">참가 일정 종료일</label>
                                        <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}>
                                            <span>{detail.endDate}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">부스 타입</label>
                                        <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}>
                                            <span>{detail.boothType}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">부스 대표자명</label>
                                        <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}>
                                            <span>{detail.representativeName}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">담당자 이메일</label>
                                        <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}>
                                            <span>{detail.email}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">담당자 연락처</label>
                                        <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}>
                                            <span>{detail.contact}</span>
                                        </div>
                                    </div>
                                    {/* 대표 사이트/SNS */}
                                    <div className="col-span-2">
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-3">대표 사이트/SNS</label>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">외부 사이트명</label>
                                                <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] pl-0 font-normal text-base bg-transparent outline-none text-left ${detail.websiteName ? 'text-black font-medium' : 'text-[#0000004c]'}`}>
                                                    <span>{detail.websiteName || '공식 사이트'}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">외부 티켓 사이트 URL</label>
                                                <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] pl-0 font-normal text-base bg-transparent outline-none text-left`}>
                                                    {detail.externalTicketUrl ? (
                                                        <a href={detail.externalTicketUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                                                            {detail.externalTicketUrl}
                                                        </a>
                                                    ) : (
                                                        <span className="text-[#0000004c]">URL 없음</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 부스 소개 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">부스 소개</h2>
                                <div className="w-full min-h-[150px] border-0 border-b border-[#0000001a] pl-0 pb-4 font-normal text-base bg-transparent outline-none text-left text-black font-medium leading-relaxed whitespace-pre-line">
                                    {detail.description}
                                </div>
                            </div>
                        </div>

                        {/* 부스 배너 이미지 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">부스 배너 이미지</h2>
                                {detail.bannerImageUrl ? (
                                    <div className="w-[240px] aspect-square bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                        <img src={detail.bannerImageUrl} alt="부스 배너" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="text-gray-500 text-sm">등록된 배너 이미지가 없습니다.</div>
                                )}
                            </div>
                        </div>

                        {/* 구역 설정 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">구역 설정</h2>
                                <div className="flex items-end gap-2">
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">구역</label>
                                        <input
                                            type="text"
                                            value={zoneInput}
                                            onChange={(e) => setZoneInput(e.target.value)}
                                            placeholder="예: A-01"
                                            maxLength={8}
                                            className="w-40 h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 pb-[14px]">
                                        <button
                                            onClick={handleSetZone}
                                            className="px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors focus:outline-none text-sm font-medium border border-blue-200 hover:border-blue-300"
                                            title="설정"
                                        >
                                            설정
                                        </button>
                                        <div className="text-sm text-gray-600">
                                            현재 설정: <span className="font-semibold">{detail.zone}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 버튼 섹션 */}
                    <div className="flex justify-center gap-3 mt-8">
                        <button onClick={handleBackToList} className="px-6 py-2 rounded-[10px] transition-colors text-sm bg-gray-500 text-white hover:bg-gray-600">목록으로 돌아가기</button>
                        <button onClick={() => setIsDeleteOpen(true)} className="px-6 py-2 rounded-[10px] transition-colors text-sm bg-red-600 text-white hover:bg-red-700">삭제</button>
                    </div>

                    {isDeleteOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
                            <div className="bg-white rounded-[10px] shadow-xl w-[520px] max-w-[90%] p-6">
                                <h3 className="text-lg font-semibold mb-3">삭제 확인</h3>
                                <div className="text-sm text-gray-700 space-y-2 mb-6">
                                    <p>삭제 시 일반 사용자에게는 해당 부스가 표시되지 않습니다.</p>
                                    <p>부스 관리자는 권한을 잃게 됩니다.</p>
                                    <p>관리자 페이지에서는 계속 표시됩니다.</p>
                                    <p className="font-medium">정말 삭제하시겠습니까?</p>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setIsDeleteOpen(false)}
                                        className="px-4 py-2 rounded-md text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={performDelete}
                                        className="px-4 py-2 rounded-md text-sm bg-red-600 text-white hover:bg-red-700"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="h-32 md:h-48" />
            </div>
        </div>
    );
};

export default BoothParticipantDetail;


