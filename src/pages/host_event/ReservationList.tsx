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
        reservationNumber: ""
    });

    // 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // 예약자 데이터
    const [reservations] = useState<Reservation[]>([
        {
            id: 1,
            name: "김민수",
            phone: "010-1234-5678",
            reservationNumber: "RES-2024-001",
            reservationDate: "2024.12.10 14:30",
            ticketQuantity: 2,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-emerald-100",
            paymentStatusTextColor: "text-emerald-800",
            checkinStatus: "미체크인",
            checkinStatusColor: "bg-gray-200"
        },
        {
            id: 2,
            name: "이영희",
            phone: "010-2345-6789",
            reservationNumber: "RES-2024-002",
            reservationDate: "2024.12.10 15:45",
            ticketQuantity: 1,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-emerald-100",
            paymentStatusTextColor: "text-emerald-800",
            checkinStatus: "체크인 완료",
            checkinStatusColor: "bg-blue-100"
        },
        {
            id: 3,
            name: "박철수",
            phone: "010-3456-7890",
            reservationNumber: "RES-2024-003",
            reservationDate: "2024.12.11 09:20",
            ticketQuantity: 4,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-emerald-100",
            paymentStatusTextColor: "text-emerald-800",
            checkinStatus: "미체크인",
            checkinStatusColor: "bg-gray-200"
        },
        {
            id: 4,
            name: "최수진",
            phone: "010-4567-8901",
            reservationNumber: "RES-2024-004",
            reservationDate: "2024.12.11 11:15",
            ticketQuantity: 1,
            paymentStatus: "환불완료",
            paymentStatusColor: "bg-red-100",
            paymentStatusTextColor: "text-red-800",
            checkinStatus: "미체크인",
            checkinStatusColor: "bg-gray-200"
        },
        {
            id: 5,
            name: "정대호",
            phone: "010-5678-9012",
            reservationNumber: "RES-2024-005",
            reservationDate: "2024.12.11 16:30",
            ticketQuantity: 3,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-emerald-100",
            paymentStatusTextColor: "text-emerald-800",
            checkinStatus: "체크인 완료",
            checkinStatusColor: "bg-blue-100"
        },
        {
            id: 6,
            name: "한소영",
            phone: "010-6789-0123",
            reservationNumber: "RES-2024-006",
            reservationDate: "2024.12.12 10:45",
            ticketQuantity: 2,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-emerald-100",
            paymentStatusTextColor: "text-emerald-800",
            checkinStatus: "미체크인",
            checkinStatusColor: "bg-gray-200"
        },
        {
            id: 7,
            name: "윤재민",
            phone: "010-7890-1234",
            reservationNumber: "RES-2024-007",
            reservationDate: "2024.12.12 13:20",
            ticketQuantity: 1,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-emerald-100",
            paymentStatusTextColor: "text-emerald-800",
            checkinStatus: "체크인 완료",
            checkinStatusColor: "bg-blue-100"
        },
        {
            id: 8,
            name: "강미래",
            phone: "010-8901-2345",
            reservationNumber: "RES-2024-008",
            reservationDate: "2024.12.12 17:10",
            ticketQuantity: 2,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-emerald-100",
            paymentStatusTextColor: "text-emerald-800",
            checkinStatus: "미체크인",
            checkinStatusColor: "bg-gray-200"
        },
        {
            id: 9,
            name: "조성우",
            phone: "010-9012-3456",
            reservationNumber: "RES-2024-009",
            reservationDate: "2024.12.13 10:00",
            ticketQuantity: 1,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-emerald-100",
            paymentStatusTextColor: "text-emerald-800",
            checkinStatus: "미체크인",
            checkinStatusColor: "bg-gray-200"
        },
        {
            id: 10,
            name: "신지영",
            phone: "010-0123-4567",
            reservationNumber: "RES-2024-010",
            reservationDate: "2024.12.13 14:15",
            ticketQuantity: 3,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-emerald-100",
            paymentStatusTextColor: "text-emerald-800",
            checkinStatus: "체크인 완료",
            checkinStatusColor: "bg-blue-100"
        },
        {
            id: 11,
            name: "임태준",
            phone: "010-1357-2468",
            reservationNumber: "RES-2024-011",
            reservationDate: "2024.12.13 16:45",
            ticketQuantity: 2,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-emerald-100",
            paymentStatusTextColor: "text-emerald-800",
            checkinStatus: "미체크인",
            checkinStatusColor: "bg-gray-200"
        },
        {
            id: 12,
            name: "배수진",
            phone: "010-2468-1357",
            reservationNumber: "RES-2024-012",
            reservationDate: "2024.12.14 09:30",
            ticketQuantity: 1,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-emerald-100",
            paymentStatusTextColor: "text-emerald-800",
            checkinStatus: "미체크인",
            checkinStatusColor: "bg-gray-200"
        },
        {
            id: 13,
            name: "오현석",
            phone: "010-3691-2580",
            reservationNumber: "RES-2024-013",
            reservationDate: "2024.12.14 12:00",
            ticketQuantity: 4,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-emerald-100",
            paymentStatusTextColor: "text-emerald-800",
            checkinStatus: "체크인 완료",
            checkinStatusColor: "bg-blue-100"
        },
        {
            id: 14,
            name: "송민아",
            phone: "010-4815-1623",
            reservationNumber: "RES-2024-014",
            reservationDate: "2024.12.14 15:20",
            ticketQuantity: 2,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-emerald-100",
            paymentStatusTextColor: "text-emerald-800",
            checkinStatus: "미체크인",
            checkinStatusColor: "bg-gray-200"
        },
        {
            id: 15,
            name: "나동혁",
            phone: "010-5926-3704",
            reservationNumber: "RES-2024-015",
            reservationDate: "2024.12.15 08:45",
            ticketQuantity: 1,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-emerald-100",
            paymentStatusTextColor: "text-emerald-800",
            checkinStatus: "미체크인",
            checkinStatusColor: "bg-gray-200"
        },
        {
            id: 16,
            name: "이서연",
            phone: "010-6037-4815",
            reservationNumber: "RES-2024-016",
            reservationDate: "2024.12.15 11:30",
            ticketQuantity: 3,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-emerald-100",
            paymentStatusTextColor: "text-emerald-800",
            checkinStatus: "체크인 완료",
            checkinStatusColor: "bg-blue-100"
        },
        {
            id: 17,
            name: "장준호",
            phone: "010-7148-5926",
            reservationNumber: "RES-2024-017",
            reservationDate: "2024.12.15 18:00",
            ticketQuantity: 2,
            paymentStatus: "환불완료",
            paymentStatusColor: "bg-red-100",
            paymentStatusTextColor: "text-red-800",
            checkinStatus: "미체크인",
            checkinStatusColor: "bg-gray-200"
        },
        {
            id: 18,
            name: "문예린",
            phone: "010-8259-6037",
            reservationNumber: "RES-2024-018",
            reservationDate: "2024.12.16 10:15",
            ticketQuantity: 1,
            paymentStatus: "결제완료",
            paymentStatusColor: "bg-emerald-100",
            paymentStatusTextColor: "text-emerald-800",
            checkinStatus: "미체크인",
            checkinStatusColor: "bg-gray-200"
        }
    ]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSearchForm(prev => ({
            ...prev,
            [name]: value
        }));
        // 필터링이 변경되면 첫 페이지로 이동
        setCurrentPage(1);
    };

    // 실시간 필터링 로직
    const filteredReservations = reservations.filter((reservation) => {
        const nameMatch = searchForm.name === "" || reservation.name.toLowerCase().includes(searchForm.name.toLowerCase());
        const phoneMatch = searchForm.phone === "" || reservation.phone.includes(searchForm.phone);
        const reservationNumberMatch = searchForm.reservationNumber === "" || reservation.reservationNumber.toLowerCase().includes(searchForm.reservationNumber.toLowerCase());

        return nameMatch && phoneMatch && reservationNumberMatch;
    });

    const handleExcelDownload = () => {
        console.log("엑셀 다운로드");

        // 엑셀용 데이터 변환 (필터링된 데이터 기준)
        const excelData = filteredReservations.map((reservation, index) => ({
            '번호': index + 1,
            '이름': reservation.name,
            '전화번호': reservation.phone,
            '예약번호': reservation.reservationNumber,
            '예약 일시': reservation.reservationDate,
            '티켓 수량': `${reservation.ticketQuantity}매`,
            '결제 상태': reservation.paymentStatus,
            '체크인 여부': reservation.checkinStatus
        }));

        // 워크북 생성
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // 컬럼 너비 설정
        const colWidths = [
            { wch: 6 },   // 번호
            { wch: 10 },  // 이름
            { wch: 15 },  // 전화번호
            { wch: 15 },  // 예약번호
            { wch: 18 },  // 예약 일시
            { wch: 10 },  // 티켓 수량
            { wch: 12 },  // 결제 상태
            { wch: 12 }   // 체크인 여부
        ];
        ws['!cols'] = colWidths;

        // 워크시트를 워크북에 추가
        XLSX.utils.book_append_sheet(wb, ws, '예약자 명단');

        // 파일명 생성 (현재 날짜 포함)
        const today = new Date();
        const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD 형태
        const fileName = `예약자_명단_${dateString}.xlsx`;

        // 파일 다운로드
        XLSX.writeFile(wb, fileName);
    };

    // 페이지네이션 로직 (필터링된 데이터 기준)
    const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentReservations = filteredReservations.slice(startIndex, endIndex);

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

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-[1407px] relative">
            <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    예약자 명단
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px]">

                    {/* 검색 섹션 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="grid grid-cols-3 gap-6">
                            {/* 이름 */}
                            <div>
                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                    이름
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={searchForm.name}
                                    onChange={handleInputChange}
                                    placeholder="이름을 입력하세요"
                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${searchForm.name ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                />
                            </div>

                            {/* 전화번호 */}
                            <div>
                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                    전화번호
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={searchForm.phone}
                                    onChange={handleInputChange}
                                    placeholder="전화번호를 입력하세요"
                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${searchForm.phone ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                />
                            </div>

                            {/* 예약번호 */}
                            <div>
                                <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                    예약번호
                                </label>
                                <input
                                    type="text"
                                    name="reservationNumber"
                                    value={searchForm.reservationNumber}
                                    onChange={handleInputChange}
                                    placeholder="예약번호를 입력하세요"
                                    className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${searchForm.reservationNumber ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                />
                            </div>
                        </div>


                    </div>

                    {/* 엑셀 다운로드 버튼 */}
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={handleExcelDownload}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors focus:outline-none flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            엑셀 다운로드
                        </button>
                    </div>

                    {/* 예약자 리스트 섹션 */}
                    <div className="bg-white rounded-lg shadow-md mb-6">

                        {/* 테이블 헤더 */}
                        <div className="bg-gray-50 border-b">
                            <div className="grid gap-4 p-4 items-center" style={{ gridTemplateColumns: '80px 140px 120px 140px 80px 100px 120px' }}>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left flex items-center">이름</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left flex items-center">전화번호</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left flex items-center">예약번호</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left flex items-center">예약 일시</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left flex items-center">티켓 수량</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left flex items-center">결제 상태</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left flex items-center">체크인 여부</div>
                            </div>
                        </div>

                        {/* 테이블 바디 */}
                        <div>
                            {currentReservations.map((reservation) => (
                                <div key={reservation.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <div className="grid gap-4 p-4 items-center" style={{ gridTemplateColumns: '80px 140px 120px 140px 80px 100px 120px' }}>
                                        <div className="text-gray-900 text-sm flex items-center text-left">{reservation.name}</div>
                                        <div className="text-gray-900 text-sm flex items-center text-left">{reservation.phone}</div>
                                        <div className="text-gray-900 text-sm flex items-center text-left">{reservation.reservationNumber}</div>
                                        <div className="text-gray-900 text-sm flex items-center text-left">{reservation.reservationDate}</div>
                                        <div className="text-gray-900 text-sm flex items-center text-left">{reservation.ticketQuantity}매</div>
                                        <div className="flex items-center text-left -ml-2">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${reservation.paymentStatusColor} ${reservation.paymentStatusTextColor}`}>
                                                {reservation.paymentStatus}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${reservation.checkinStatusColor} ${reservation.checkinStatus === '체크인 완료' ? 'text-blue-800' : 'text-gray-800'}`}>
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
                                총 {filteredReservations.length}명 중 {startIndex + 1}-{Math.min(endIndex, filteredReservations.length)}명 표시
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === 1
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
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === page
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
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === totalPages
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
