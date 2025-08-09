import React, { useState } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';

// 부스 신청 데이터 타입
interface BoothApplication {
    id: number;
    applicationNumber: string;
    boothName: string;
    boothType: string;
    applicationDate: string;
    processStatus: string;
    processStatusColor: string;
    processStatusTextColor: string;
    paymentStatus: string;
    paymentStatusColor: string;
    paymentStatusTextColor: string;
    applicantName: string;
    contact: string;
}

export const BoothApplicationList = () => {
    const navigate = useNavigate();
    
    const [searchForm, setSearchForm] = useState({
        applicationNumber: "",
        boothName: "",
        boothType: ""
    });

    // 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // 부스 신청 데이터
    const [applications] = useState<BoothApplication[]>([
        {
            id: 1,
            applicationNumber: "BOOTH-2024-001",
            boothName: "FoodTech 스타트업 부스",
            boothType: "스탠다드 부스",
            applicationDate: "2024.12.10 14:30",
            processStatus: "승인완료",
            processStatusColor: "bg-emerald-100",
            processStatusTextColor: "text-emerald-800",
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-blue-100",
            paymentStatusTextColor: "text-blue-800",
            applicantName: "김민수",
            contact: "010-1234-5678"
        },
        {
            id: 2,
            applicationNumber: "BOOTH-2024-002",
            boothName: "AI 솔루션 체험관",
            boothType: "프리미엄 부스",
            applicationDate: "2024.12.10 15:45",
            processStatus: "검토중",
            processStatusColor: "bg-yellow-100",
            processStatusTextColor: "text-yellow-800",
            paymentStatus: "결제대기",
            paymentStatusColor: "bg-gray-100",
            paymentStatusTextColor: "text-gray-800",
            applicantName: "이영희",
            contact: "010-2345-6789"
        },
        {
            id: 3,
            applicationNumber: "BOOTH-2024-003",
            boothName: "그린 에너지 전시관",
            boothType: "스탠다드 부스",
            applicationDate: "2024.12.11 09:20",
            processStatus: "승인완료",
            processStatusColor: "bg-emerald-100",
            processStatusTextColor: "text-emerald-800",
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-blue-100",
            paymentStatusTextColor: "text-blue-800",
            applicantName: "박철수",
            contact: "010-3456-7890"
        },
        {
            id: 4,
            applicationNumber: "BOOTH-2024-004",
            boothName: "스마트 헬스케어 존",
            boothType: "프리미엄 부스",
            applicationDate: "2024.12.11 11:15",
            processStatus: "반려",
            processStatusColor: "bg-red-100",
            processStatusTextColor: "text-red-800",
            paymentStatus: "환불완료",
            paymentStatusColor: "bg-red-100",
            paymentStatusTextColor: "text-red-800",
            applicantName: "최수진",
            contact: "010-4567-8901"
        },
        {
            id: 5,
            applicationNumber: "BOOTH-2024-005",
            boothName: "핀테크 혁신 라운지",
            boothType: "스탠다드 부스",
            applicationDate: "2024.12.11 16:30",
            processStatus: "승인완료",
            processStatusColor: "bg-emerald-100",
            processStatusTextColor: "text-emerald-800",
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-blue-100",
            paymentStatusTextColor: "text-blue-800",
            applicantName: "정대호",
            contact: "010-5678-9012"
        },
        {
            id: 6,
            applicationNumber: "BOOTH-2024-006",
            boothName: "디지털 교육 체험관",
            boothType: "스탠다드 부스",
            applicationDate: "2024.12.12 10:45",
            processStatus: "검토중",
            processStatusColor: "bg-yellow-100",
            processStatusTextColor: "text-yellow-800",
            paymentStatus: "결제대기",
            paymentStatusColor: "bg-gray-100",
            paymentStatusTextColor: "text-gray-800",
            applicantName: "한소영",
            contact: "010-6789-0123"
        },
        {
            id: 7,
            applicationNumber: "BOOTH-2024-007",
            boothName: "블록체인 기술 showcase",
            boothType: "프리미엄 부스",
            applicationDate: "2024.12.12 13:20",
            processStatus: "승인완료",
            processStatusColor: "bg-emerald-100",
            processStatusTextColor: "text-emerald-800",
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-blue-100",
            paymentStatusTextColor: "text-blue-800",
            applicantName: "윤재민",
            contact: "010-7890-1234"
        },
        {
            id: 8,
            applicationNumber: "BOOTH-2024-008",
            boothName: "로봇 자동화 데모존",
            boothType: "스탠다드 부스",
            applicationDate: "2024.12.12 17:10",
            processStatus: "검토중",
            processStatusColor: "bg-yellow-100",
            processStatusTextColor: "text-yellow-800",
            paymentStatus: "결제대기",
            paymentStatusColor: "bg-gray-100",
            paymentStatusTextColor: "text-gray-800",
            applicantName: "강미래",
            contact: "010-8901-2345"
        },
        {
            id: 9,
            applicationNumber: "BOOTH-2024-009",
            boothName: "바이오테크 연구소",
            boothType: "스탠다드 부스",
            applicationDate: "2024.12.13 10:00",
            processStatus: "승인완료",
            processStatusColor: "bg-emerald-100",
            processStatusTextColor: "text-emerald-800",
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-blue-100",
            paymentStatusTextColor: "text-blue-800",
            applicantName: "조성우",
            contact: "010-9012-3456"
        },
        {
            id: 10,
            applicationNumber: "BOOTH-2024-010",
            boothName: "가상현실 체험관",
            boothType: "프리미엄 부스",
            applicationDate: "2024.12.13 14:15",
            processStatus: "승인완료",
            processStatusColor: "bg-emerald-100",
            processStatusTextColor: "text-emerald-800",
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-blue-100",
            paymentStatusTextColor: "text-blue-800",
            applicantName: "신지영",
            contact: "010-0123-4567"
        },
        {
            id: 11,
            applicationNumber: "BOOTH-2024-011",
            boothName: "사물인터넷 스마트홈",
            boothType: "스탠다드 부스",
            applicationDate: "2024.12.13 16:45",
            processStatus: "검토중",
            processStatusColor: "bg-yellow-100",
            processStatusTextColor: "text-yellow-800",
            paymentStatus: "결제대기",
            paymentStatusColor: "bg-gray-100",
            paymentStatusTextColor: "text-gray-800",
            applicantName: "임태준",
            contact: "010-1357-2468"
        },
        {
            id: 12,
            applicationNumber: "BOOTH-2024-012",
            boothName: "클라우드 컴퓨팅 센터",
            boothType: "프리미엄 부스",
            applicationDate: "2024.12.14 09:30",
            processStatus: "승인완료",
            processStatusColor: "bg-emerald-100",
            processStatusTextColor: "text-emerald-800",
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-blue-100",
            paymentStatusTextColor: "text-blue-800",
            applicantName: "배수진",
            contact: "010-2468-1357"
        },
        {
            id: 13,
            applicationNumber: "BOOTH-2024-013",
            boothName: "자율주행 기술 체험",
            boothType: "스탠다드 부스",
            applicationDate: "2024.12.14 12:00",
            processStatus: "승인완료",
            processStatusColor: "bg-emerald-100",
            processStatusTextColor: "text-emerald-800",
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-blue-100",
            paymentStatusTextColor: "text-blue-800",
            applicantName: "오현석",
            contact: "010-3691-2580"
        },
        {
            id: 14,
            applicationNumber: "BOOTH-2024-014",
            boothName: "양자컴퓨팅 연구실",
            boothType: "스탠다드 부스",
            applicationDate: "2024.12.14 15:20",
            processStatus: "검토중",
            processStatusColor: "bg-yellow-100",
            processStatusTextColor: "text-yellow-800",
            paymentStatus: "결제대기",
            paymentStatusColor: "bg-gray-100",
            paymentStatusTextColor: "text-gray-800",
            applicantName: "송민아",
            contact: "010-4815-1623"
        },
        {
            id: 15,
            applicationNumber: "BOOTH-2024-015",
            boothName: "우주항공 기술관",
            boothType: "프리미엄 부스",
            applicationDate: "2024.12.15 08:45",
            processStatus: "승인완료",
            processStatusColor: "bg-emerald-100",
            processStatusTextColor: "text-emerald-800",
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-blue-100",
            paymentStatusTextColor: "text-blue-800",
            applicantName: "나동혁",
            contact: "010-5926-3704"
        },
        {
            id: 16,
            applicationNumber: "BOOTH-2024-016",
            boothName: "메타버스 콘텐츠 존",
            boothType: "프리미엄 부스",
            applicationDate: "2024.12.15 11:30",
            processStatus: "승인완료",
            processStatusColor: "bg-emerald-100",
            processStatusTextColor: "text-emerald-800",
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-blue-100",
            paymentStatusTextColor: "text-blue-800",
            applicantName: "이서연",
            contact: "010-6037-4815"
        },
        {
            id: 17,
            applicationNumber: "BOOTH-2024-017",
            boothName: "신재생에너지 솔루션",
            boothType: "스탠다드 부스",
            applicationDate: "2024.12.15 18:00",
            processStatus: "반려",
            processStatusColor: "bg-red-100",
            processStatusTextColor: "text-red-800",
            paymentStatus: "환불완료",
            paymentStatusColor: "bg-red-100",
            paymentStatusTextColor: "text-red-800",
            applicantName: "장준호",
            contact: "010-7148-5926"
        },
        {
            id: 18,
            applicationNumber: "BOOTH-2024-018",
            boothName: "인공지능 모델링 스튜디오",
            boothType: "프리미엄 부스",
            applicationDate: "2024.12.16 10:15",
            processStatus: "검토중",
            processStatusColor: "bg-yellow-100",
            processStatusTextColor: "text-yellow-800",
            paymentStatus: "결제대기",
            paymentStatusColor: "bg-gray-100",
            paymentStatusTextColor: "text-gray-800",
            applicantName: "문예린",
            contact: "010-8259-6037"
        }
    ]);

    // 검색 폼 변경 핸들러
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSearchForm(prev => ({
            ...prev,
            [name]: value
        }));
        setCurrentPage(1); // 검색 시 첫 페이지로 리셋
    };

    // 검색된 데이터 필터링
    const filteredApplications = applications.filter(application => {
        const matchesApplicationNumber = !searchForm.applicationNumber || 
            application.applicationNumber.toLowerCase().includes(searchForm.applicationNumber.toLowerCase());
        const matchesBoothName = !searchForm.boothName || 
            application.boothName.toLowerCase().includes(searchForm.boothName.toLowerCase());
        const matchesBoothType = !searchForm.boothType || 
            application.boothType === searchForm.boothType;
        
        return matchesApplicationNumber && matchesBoothName && matchesBoothType;
    });

    // 페이지네이션 계산
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentApplications = filteredApplications.slice(startIndex, endIndex);

    // 페이지 변경 핸들러
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // 엑셀 다운로드 함수
    const handleExcelDownload = () => {
        // 현재 필터링된 데이터를 엑셀 형태로 변환
        const excelData = filteredApplications.map((application, index) => ({
            '번호': index + 1,
            '신청번호': application.applicationNumber,
            '부스명': application.boothName,
            '부스타입': application.boothType,
            '신청일시': application.applicationDate,
            '처리상태': application.processStatus,
            '결제상태': application.paymentStatus,
            '신청자명': application.applicantName,
            '연락처': application.contact
        }));

        // 워크북 생성
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // 컬럼 너비 설정
        const colWidths = [
            { wch: 6 },   // 번호
            { wch: 15 },  // 신청번호
            { wch: 20 },  // 부스명
            { wch: 10 },  // 부스타입
            { wch: 18 },  // 신청일시
            { wch: 10 },  // 처리상태
            { wch: 10 },  // 결제상태
            { wch: 10 },  // 신청자명
            { wch: 15 }   // 연락처
        ];
        ws['!cols'] = colWidths;

        // 워크시트를 워크북에 추가
        XLSX.utils.book_append_sheet(wb, ws, '부스 신청 목록');

        // 파일명 생성 (현재 날짜 포함)
        const today = new Date();
        const dateString = today.getFullYear() + 
                          String(today.getMonth() + 1).padStart(2, '0') + 
                          String(today.getDate()).padStart(2, '0');
        const fileName = `부스신청목록_${dateString}.xlsx`;

        // 파일 다운로드
        XLSX.writeFile(wb, fileName);
    };

    const handleViewDetail = (applicationId: number) => {
        navigate(`/host/booth-applications/${applicationId}`);
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-[1407px] relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    부스 신청 목록
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px]">
                    
                    {/* 검색 영역 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">검색 조건</h3>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">신청번호</label>
                                <input
                                    type="text"
                                    name="applicationNumber"
                                    value={searchForm.applicationNumber}
                                    onChange={handleSearchChange}
                                    placeholder="신청번호 검색"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">부스명</label>
                                <input
                                    type="text"
                                    name="boothName"
                                    value={searchForm.boothName}
                                    onChange={handleSearchChange}
                                    placeholder="부스명 검색"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">부스타입</label>
                                <select
                                    name="boothType"
                                    value={searchForm.boothType}
                                    onChange={handleSearchChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">전체</option>
                                    <option value="스탠다드 부스">스탠다드 부스</option>
                                    <option value="프리미엄 부스">프리미엄 부스</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* 엑셀 다운로드 버튼 */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleExcelDownload}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                <Download size={16} />
                                엑셀 다운로드
                            </button>
                        </div>
                    </div>

                    {/* 결과 요약 */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            총 <span className="font-semibold text-blue-600">{filteredApplications.length}</span>건의 부스 신청이 있습니다.
                        </p>
                    </div>

                    {/* 테이블 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* 테이블 헤더 */}
                        <div className="bg-gray-50 border-b">
                            <div className="grid gap-4 p-4 items-center" style={{ gridTemplateColumns: '120px 180px 100px 130px 90px 90px 100px' }}>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left flex items-center">신청번호</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left flex items-center">부스명</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left flex items-center -ml-2">부스타입</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left flex items-center">신청일시</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left flex items-center">처리상태</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left flex items-center">결제상태</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left flex items-center">상세보기</div>
                            </div>
                        </div>

                        {/* 테이블 바디 */}
                        <div>
                            {currentApplications.map((application) => (
                                <div key={application.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <div className="grid gap-4 p-4 items-center" style={{ gridTemplateColumns: '120px 180px 100px 130px 90px 90px 100px' }}>
                                        <div className="text-gray-900 text-sm flex items-center text-left">{application.applicationNumber}</div>
                                        <div className="text-gray-900 text-sm flex items-center text-left truncate" title={application.boothName}>{application.boothName}</div>
                                        <div className="text-gray-900 text-sm flex items-center text-left -ml-2">{application.boothType}</div>
                                        <div className="text-gray-900 text-sm flex items-center text-left">{application.applicationDate}</div>
                                        <div className="flex items-center text-left -ml-2">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${application.processStatusColor} ${application.processStatusTextColor}`}>
                                                {application.processStatus}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-left -ml-2">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${application.paymentStatusColor} ${application.paymentStatusTextColor}`}>
                                                {application.paymentStatus}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => handleViewDetail(application.id)}
                                                className="px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors focus:outline-none text-sm font-medium border border-blue-200 hover:border-blue-300"
                                                title="상세보기"
                                            >
                                                상세보기
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 페이지네이션 */}
                        <div className="flex items-center justify-between px-6 py-4 border-t">
                            <div className="text-sm text-gray-700">
                                총 {filteredApplications.length}건 중 {startIndex + 1}-{Math.min(endIndex, filteredApplications.length)}건 표시
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                        currentPage === 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    이전
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                            currentPage === page
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                        currentPage === totalPages
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    다음
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
