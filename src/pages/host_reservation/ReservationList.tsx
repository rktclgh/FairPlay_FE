import React, { useState } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';

// 예약자 데이터 타입
interface Reservation {
    id: number;
    name: string;
    phone: string;
    reservationNumber: string;
    reservationDate: string;
    ticketQuantity: number;
    paymentStatus: string;
    paymentStatusColor: string;
    paymentStatusTextColor: string;
    checkinStatus: string;
    checkinStatusColor: string;
}

export const ReservationList = () => {
    const [searchForm, setSearchForm] = useState({
        name: "",
        phone: "",
        reservationNumber: "",
        paymentStatus: "",
        checkinStatus: ""
    });

    // 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // 예약자 데이터
    const [reservations] = useState<Reservation[]>([
        {
            id: 1,
            name: "김철수",
            phone: "010-1234-5678",
            reservationNumber: "RES-2024-001",
            reservationDate: "2024.12.01 14:30",
            ticketQuantity: 2,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-blue-100",
            paymentStatusTextColor: "text-blue-800",
            checkinStatus: "미입장",
            checkinStatusColor: "bg-gray-100"
        },
        {
            id: 2,
            name: "이영희",
            phone: "010-2345-6789",
            reservationNumber: "RES-2024-002",
            reservationDate: "2024.12.01 15:45",
            ticketQuantity: 1,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-blue-100",
            paymentStatusTextColor: "text-blue-800",
            checkinStatus: "입장완료",
            checkinStatusColor: "bg-green-100"
        },
        {
            id: 3,
            name: "박민수",
            phone: "010-3456-7890",
            reservationNumber: "RES-2024-003",
            reservationDate: "2024.12.02 09:20",
            ticketQuantity: 3,
            paymentStatus: "결제대기",
            paymentStatusColor: "bg-yellow-100",
            paymentStatusTextColor: "text-yellow-800",
            checkinStatus: "미입장",
            checkinStatusColor: "bg-gray-100"
        },
        {
            id: 4,
            name: "정수진",
            phone: "010-4567-8901",
            reservationNumber: "RES-2024-004",
            reservationDate: "2024.12.02 11:15",
            ticketQuantity: 4,
            paymentStatus: "환불완료",
            paymentStatusColor: "bg-red-100",
            paymentStatusTextColor: "text-red-800",
            checkinStatus: "취소",
            checkinStatusColor: "bg-red-100"
        },
        {
            id: 5,
            name: "최대호",
            phone: "010-5678-9012",
            reservationNumber: "RES-2024-005",
            reservationDate: "2024.12.02 16:30",
            ticketQuantity: 2,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-blue-100",
            paymentStatusTextColor: "text-blue-800",
            checkinStatus: "입장완료",
            checkinStatusColor: "bg-green-100"
        },
        {
            id: 6,
            name: "한소영",
            phone: "010-6789-0123",
            reservationNumber: "RES-2024-006",
            reservationDate: "2024.12.03 10:45",
            ticketQuantity: 1,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-blue-100",
            paymentStatusTextColor: "text-blue-800",
            checkinStatus: "미입장",
            checkinStatusColor: "bg-gray-100"
        },
        {
            id: 7,
            name: "윤재민",
            phone: "010-7890-1234",
            reservationNumber: "RES-2024-007",
            reservationDate: "2024.12.03 13:20",
            ticketQuantity: 5,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-blue-100",
            paymentStatusTextColor: "text-blue-800",
            checkinStatus: "입장완료",
            checkinStatusColor: "bg-green-100"
        },
        {
            id: 8,
            name: "강미래",
            phone: "010-8901-2345",
            reservationNumber: "RES-2024-008",
            reservationDate: "2024.12.03 17:10",
            ticketQuantity: 2,
            paymentStatus: "결제대기",
            paymentStatusColor: "bg-yellow-100",
            paymentStatusTextColor: "text-yellow-800",
            checkinStatus: "미입장",
            checkinStatusColor: "bg-gray-100"
        },
        {
            id: 9,
            name: "조성우",
            phone: "010-9012-3456",
            reservationNumber: "RES-2024-009",
            reservationDate: "2024.12.04 10:00",
            ticketQuantity: 3,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-blue-100",
            paymentStatusTextColor: "text-blue-800",
            checkinStatus: "입장완료",
            checkinStatusColor: "bg-green-100"
        },
        {
            id: 10,
            name: "신지영",
            phone: "010-0123-4567",
            reservationNumber: "RES-2024-010",
            reservationDate: "2024.12.04 14:15",
            ticketQuantity: 1,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-blue-100",
            paymentStatusTextColor: "text-blue-800",
            checkinStatus: "미입장",
            checkinStatusColor: "bg-gray-100"
        },
        {
            id: 11,
            name: "임태준",
            phone: "010-1357-2468",
            reservationNumber: "RES-2024-011",
            reservationDate: "2024.12.04 16:45",
            ticketQuantity: 2,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-blue-100",
            paymentStatusTextColor: "text-blue-800",
            checkinStatus: "입장완료",
            checkinStatusColor: "bg-green-100"
        },
        {
            id: 12,
            name: "배수진",
            phone: "010-2468-1357",
            reservationNumber: "RES-2024-012",
            reservationDate: "2024.12.05 09:30",
            ticketQuantity: 4,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-blue-100",
            paymentStatusTextColor: "text-blue-800",
            checkinStatus: "미입장",
            checkinStatusColor: "bg-gray-100"
        },
        {
            id: 13,
            name: "오현석",
            phone: "010-3691-2580",
            reservationNumber: "RES-2024-013",
            reservationDate: "2024.12.05 12:00",
            ticketQuantity: 1,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-blue-100",
            paymentStatusTextColor: "text-blue-800",
            checkinStatus: "입장완료",
            checkinStatusColor: "bg-green-100"
        },
        {
            id: 14,
            name: "송민아",
            phone: "010-4815-1623",
            reservationNumber: "RES-2024-014",
            reservationDate: "2024.12.05 15:20",
            ticketQuantity: 3,
            paymentStatus: "결제대기",
            paymentStatusColor: "bg-yellow-100",
            paymentStatusTextColor: "text-yellow-800",
            checkinStatus: "미입장",
            checkinStatusColor: "bg-gray-100"
        },
        {
            id: 15,
            name: "나동혁",
            phone: "010-5926-3704",
            reservationNumber: "RES-2024-015",
            reservationDate: "2024.12.05 18:45",
            ticketQuantity: 2,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-blue-100",
            paymentStatusTextColor: "text-blue-800",
            checkinStatus: "미입장",
            checkinStatusColor: "bg-gray-100"
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
    const filteredReservations = reservations.filter(reservation => {
        const matchesName = !searchForm.name || 
            reservation.name.toLowerCase().includes(searchForm.name.toLowerCase());
        const matchesPhone = !searchForm.phone || 
            reservation.phone.includes(searchForm.phone);
        const matchesReservationNumber = !searchForm.reservationNumber || 
            reservation.reservationNumber.toLowerCase().includes(searchForm.reservationNumber.toLowerCase());
        const matchesPaymentStatus = !searchForm.paymentStatus || 
            reservation.paymentStatus === searchForm.paymentStatus;
        const matchesCheckinStatus = !searchForm.checkinStatus || 
            reservation.checkinStatus === searchForm.checkinStatus;
        
        return matchesName && matchesPhone && matchesReservationNumber && 
               matchesPaymentStatus && matchesCheckinStatus;
    });

    // 페이지네이션 계산
    const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentReservations = filteredReservations.slice(startIndex, endIndex);

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
        const excelData = filteredReservations.map((reservation, index) => ({
            '번호': index + 1,
            '예약자명': reservation.name,
            '연락처': reservation.phone,
            '예약번호': reservation.reservationNumber,
            '예약일시': reservation.reservationDate,
            '티켓수량': reservation.ticketQuantity,
            '결제상태': reservation.paymentStatus,
            '입장상태': reservation.checkinStatus
        }));

        // 워크북 생성
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // 컬럼 너비 설정
        const colWidths = [
            { wch: 6 },   // 번호
            { wch: 10 },  // 예약자명
            { wch: 15 },  // 연락처
            { wch: 15 },  // 예약번호
            { wch: 18 },  // 예약일시
            { wch: 8 },   // 티켓수량
            { wch: 10 },  // 결제상태
            { wch: 10 }   // 입장상태
        ];
        ws['!cols'] = colWidths;

        // 워크시트를 워크북에 추가
        XLSX.utils.book_append_sheet(wb, ws, '예약자 목록');

        // 파일명 생성 (현재 날짜 포함)
        const today = new Date();
        const dateString = today.getFullYear() + 
                          String(today.getMonth() + 1).padStart(2, '0') + 
                          String(today.getDate()).padStart(2, '0');
        const fileName = `예약자목록_${dateString}.xlsx`;

        // 파일 다운로드
        XLSX.writeFile(wb, fileName);
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-[1407px] relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    예약자 목록
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">예약자명</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={searchForm.name}
                                    onChange={handleSearchChange}
                                    placeholder="예약자명 검색"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={searchForm.phone}
                                    onChange={handleSearchChange}
                                    placeholder="연락처 검색"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">예약번호</label>
                                <input
                                    type="text"
                                    name="reservationNumber"
                                    value={searchForm.reservationNumber}
                                    onChange={handleSearchChange}
                                    placeholder="예약번호 검색"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">결제상태</label>
                                <select
                                    name="paymentStatus"
                                    value={searchForm.paymentStatus}
                                    onChange={handleSearchChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">전체</option>
                                    <option value="결제완료">결제완료</option>
                                    <option value="결제대기">결제대기</option>
                                    <option value="환불완료">환불완료</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">입장상태</label>
                                <select
                                    name="checkinStatus"
                                    value={searchForm.checkinStatus}
                                    onChange={handleSearchChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">전체</option>
                                    <option value="미입장">미입장</option>
                                    <option value="입장완료">입장완료</option>
                                    <option value="취소">취소</option>
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
                            총 <span className="font-semibold text-blue-600">{filteredReservations.length}</span>건의 예약이 있습니다.
                        </p>
                    </div>

                    {/* 테이블 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* 테이블 헤더 */}
                        <div className="bg-gray-50 border-b">
                            <div className="grid gap-4 p-4 items-center" style={{ gridTemplateColumns: '100px 120px 150px 140px 80px 80px 80px' }}>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left flex items-center">예약자명</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left flex items-center">연락처</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left flex items-center">예약번호</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left flex items-center">예약일시</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left flex items-center">티켓수량</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left flex items-center">결제상태</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left flex items-center">입장상태</div>
                            </div>
                        </div>

                        {/* 테이블 바디 */}
                        <div>
                            {currentReservations.map((reservation) => (
                                <div key={reservation.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <div className="grid gap-4 p-4 items-center" style={{ gridTemplateColumns: '100px 120px 150px 140px 80px 80px 80px' }}>
                                        <div className="text-gray-900 text-sm flex items-center text-left">{reservation.name}</div>
                                        <div className="text-gray-900 text-sm flex items-center text-left">{reservation.phone}</div>
                                        <div className="text-gray-900 text-sm flex items-center text-left">{reservation.reservationNumber}</div>
                                        <div className="text-gray-900 text-sm flex items-center text-left">{reservation.reservationDate}</div>
                                        <div className="text-gray-900 text-sm flex items-center text-left">{reservation.ticketQuantity}매</div>
                                        <div className="flex items-center text-left">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${reservation.paymentStatusColor} ${reservation.paymentStatusTextColor}`}>
                                                {reservation.paymentStatus}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-left">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${reservation.checkinStatusColor} ${
                                                reservation.checkinStatus === '입장완료' ? 'text-green-800' :
                                                reservation.checkinStatus === '취소' ? 'text-red-800' : 'text-gray-800'
                                            }`}>
                                                {reservation.checkinStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 페이지네이션 */}
                        <div className="flex items-center justify-between px-6 py-4 border-t">
                            <div className="text-sm text-gray-700">
                                총 {filteredReservations.length}건 중 {startIndex + 1}-{Math.min(endIndex, filteredReservations.length)}건 표시
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
