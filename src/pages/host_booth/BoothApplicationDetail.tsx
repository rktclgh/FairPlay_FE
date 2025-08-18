import { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { useParams, useNavigate } from "react-router-dom";

// 부스 신청 상세 정보 타입
interface BoothApplicationDetail {
    id: number;
    applicationNumber: string;
    applicationDate: string;
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
    processStatus: string;
    paymentStatus: string;
    adminMemo: string;
}

export const BoothApplicationDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [applicationDetail] = useState<BoothApplicationDetail>({
        id: 1,
        applicationNumber: "BOOTH-2024-001",
        applicationDate: "2024.12.10 14:30",
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
        bannerImageUrl: "https://picsum.photos/seed/booth1/600/600",
        description: "혁신적인 푸드테크 기술을 소개하는 부스입니다. 최신 AI 기반 음식 추천 시스템과 스마트 주방 솔루션을 전시할 예정입니다. 방문객들에게 직접 체험할 수 있는 기회를 제공하여 새로운 식문화의 변화를 보여드리고자 합니다.\n\n주요 전시 내용:\n- AI 기반 개인 맞춤형 음식 추천 앱\n- 스마트 쿠킹 디바이스 실시간 데모\n- 친환경 포장재 솔루션 소개\n- 푸드 트레이싱 시스템 체험\n\n목표:\n참가자들에게 미래 식품 산업의 트렌드를 소개하고, 실제 제품을 체험해볼 수 있는 기회를 제공합니다.",
        processStatus: "승인완료",
        paymentStatus: "결제완료",
        adminMemo: ""
    });

    // 상태별 색상 매핑 함수
    const getStatusColors = (status: string, type: 'process' | 'payment') => {
        if (type === 'process') {
            switch (status) {
                case '승인완료':
                    return { bg: 'bg-emerald-100', text: 'text-emerald-800' };
                case '검토중':
                    return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
                case '반려':
                    return { bg: 'bg-red-100', text: 'text-red-800' };
                case '보류':
                    return { bg: 'bg-gray-100', text: 'text-gray-800' };
                default:
                    return { bg: 'bg-gray-100', text: 'text-gray-800' };
            }
        } else {
            switch (status) {
                case '결제완료':
                    return { bg: 'bg-blue-100', text: 'text-blue-800' };
                case '결제대기':
                    return { bg: 'bg-gray-100', text: 'text-gray-800' };
                case '환불완료':
                    return { bg: 'bg-red-100', text: 'text-red-800' };
                default:
                    return { bg: 'bg-gray-100', text: 'text-gray-800' };
            }
        }
    };

    const [adminMemo, setAdminMemo] = useState("");
    const [processStatus, setProcessStatus] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");

    useEffect(() => {
        // 실제로는 API를 통해 데이터를 가져옴
        if (id) {
            setProcessStatus(applicationDetail.processStatus);
            setPaymentStatus(applicationDetail.paymentStatus);
            setAdminMemo(applicationDetail.adminMemo);
        }
    }, [id, applicationDetail]);

    const handleSave = () => {
        console.log("저장:", {
            processStatus,
            paymentStatus,
            adminMemo
        });
        // 실제로는 API 호출
        alert("저장되었습니다.");

        // 저장 후 목록으로 자동 이동
        navigate("/host/booth-applications");
    };

    const handleBackToList = () => {
        navigate("/host/booth-applications");
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-auto relative min-h-screen">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    {applicationDetail.boothName}
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-24">

                    {/* 폼 컨테이너 시작 */}
                    <div className="bg-white">
                        {/* 기본 정보 섹션 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">
                                    기본 정보
                                </h2>
                                <div className="grid grid-cols-2 gap-8">
                                    {/* 신청번호 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            신청번호
                                        </label>
                                        <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}>
                                            <span>{applicationDetail.applicationNumber}</span>
                                        </div>
                                    </div>

                                    {/* 신청일시 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            신청일시
                                        </label>
                                        <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}>
                                            <span>{applicationDetail.applicationDate}</span>
                                        </div>
                                    </div>

                                    {/* 참가 일정 시작일 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            참가 일정 시작일
                                        </label>
                                        <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}>
                                            <span>{applicationDetail.startDate}</span>
                                        </div>
                                    </div>

                                    {/* 참가 일정 종료일 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            참가 일정 종료일
                                        </label>
                                        <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}>
                                            <span>{applicationDetail.endDate}</span>
                                        </div>
                                    </div>



                                    {/* 부스 타입 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            부스 타입
                                        </label>
                                        <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}>
                                            <span>{applicationDetail.boothType}</span>
                                        </div>
                                    </div>

                                    {/* 부스 대표자명 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            부스 대표자명
                                        </label>
                                        <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}>
                                            <span>{applicationDetail.representativeName}</span>
                                        </div>
                                    </div>

                                    {/* 담당자 이메일 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            담당자 이메일
                                        </label>
                                        <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}>
                                            <span>{applicationDetail.email}</span>
                                        </div>
                                    </div>

                                    {/* 담당자 연락처 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                            담당자 연락처
                                        </label>
                                        <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left text-black font-medium`}>
                                            <span>{applicationDetail.contact}</span>
                                        </div>
                                    </div>

                                    {/* 대표 사이트/SNS */}
                                    <div className="col-span-2">
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-3">
                                            대표 사이트/SNS
                                        </label>
                                        <div className="grid grid-cols-2 gap-8">
                                            {/* 외부 사이트명 */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">외부 사이트명</label>
                                                <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${applicationDetail.websiteName ? 'text-black font-medium' : 'text-[#0000004c]'}`}>
                                                    <span>{applicationDetail.websiteName || '공식 사이트'}</span>
                                                </div>
                                            </div>
                                            {/* 외부 티켓 사이트 URL */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">외부 티켓 사이트 URL</label>
                                                <div className={`flex items-center w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left`}>
                                                    {applicationDetail.externalTicketUrl ? (
                                                        <a href={applicationDetail.externalTicketUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                                                            {applicationDetail.externalTicketUrl}
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

                        {/* 부스 소개 섹션 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">
                                    부스 소개
                                </h2>
                                <div className="w-full min-h-[150px] border-0 border-b border-[#0000001a] rounded-none pl-0 pb-4 font-normal text-base bg-transparent outline-none text-left text-black font-medium leading-relaxed whitespace-pre-line">
                                    {applicationDetail.description}
                                </div>
                            </div>
                        </div>

                        {/* 부스 배너 이미지 (정방형, 단일) */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">
                                    부스 배너 이미지
                                </h2>
                                {applicationDetail.bannerImageUrl ? (
                                    <div className="w-[240px] aspect-square bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                        <img src={applicationDetail.bannerImageUrl} alt="부스 배너" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="text-gray-500 text-sm">등록된 배너 이미지가 없습니다.</div>
                                )}
                            </div>
                        </div>

                        {/* 처리 상태 관리 섹션 */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">
                                    처리 상태 관리
                                </h2>

                                <div className="grid grid-cols-2 gap-8 mb-6">
                                    {/* 처리 상태 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-3">
                                            처리 상태
                                        </label>
                                        <div className="flex items-center gap-4 h-[54px]">
                                            {/* 현재 상태 배지 */}
                                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium min-w-[70px] ${getStatusColors(processStatus, 'process').bg} ${getStatusColors(processStatus, 'process').text}`}>
                                                {processStatus}
                                            </span>

                                            {/* 상태 변경 드롭다운 */}
                                            <div className="relative">
                                                <select
                                                    value={processStatus}
                                                    onChange={(e) => setProcessStatus(e.target.value)}
                                                    className="w-40 h-10 border-2 border-gray-300 rounded-lg px-3 pr-8 text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all appearance-none cursor-pointer hover:border-gray-400"
                                                >
                                                    <option value="검토중">검토중</option>
                                                    <option value="승인완료">승인완료</option>
                                                    <option value="반려">반려</option>
                                                    <option value="보류">보류</option>
                                                </select>
                                                {/* 커스텀 화살표 아이콘 */}
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 결제 상태 */}
                                    <div>
                                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-3">
                                            결제 상태
                                        </label>
                                        <div className="flex items-center h-[54px]">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColors(applicationDetail.paymentStatus, 'payment').bg} ${getStatusColors(applicationDetail.paymentStatus, 'payment').text}`}>
                                                {applicationDetail.paymentStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 관리자 메모 */}
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-2">
                                        관리자 메모
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            value={adminMemo}
                                            onChange={(e) => setAdminMemo(e.target.value)}
                                            placeholder="관리자 메모를 입력하세요"
                                            className={`w-full h-[120px] border border-gray-300 rounded-md p-3 font-normal text-base bg-white outline-none text-left resize-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 ${adminMemo ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* 폼 컨테이너 끝 */}

                    {/* 버튼 섹션 */}
                    <div className="flex flex-col items-center space-y-4 mt-8">
                        <div className="flex gap-4">
                            <button
                                onClick={handleBackToList}
                                className="px-6 py-2 rounded-[10px] transition-colors text-sm bg-gray-500 text-white hover:bg-gray-600"
                            >
                                목록으로 돌아가기
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 rounded-[10px] transition-colors text-sm bg-blue-500 text-white hover:bg-blue-600"
                            >
                                저장
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 text-center">
                            변경된 정보는 즉시 반영됩니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
