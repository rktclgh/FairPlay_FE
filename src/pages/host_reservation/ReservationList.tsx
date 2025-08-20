import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { Download, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import reservationService from "../../services/reservationService";
import {
    ReservationUIData,
    ReservationFilter,
    ReservationListResponse,
    RESERVATION_STATUS,
    RESERVATION_STATUS_NAMES
} from "../../services/types/reservationType";

export const ReservationList: React.FC = () => {
    // URL 파라미터에서 eventId 추출
    const { eventId: eventIdParam } = useParams<{ eventId: string }>();
    const navigate = useNavigate();

    // eventId 파싱 및 유효성 검사
    const eventId = React.useMemo(() => {
        const parsed = eventIdParam ? parseInt(eventIdParam, 10) : null;
        if (!parsed || isNaN(parsed) || parsed <= 0) {
            console.error('유효하지 않은 eventId:', eventIdParam);
            return null;
        }
        return parsed;
    }, [eventIdParam]);
    // 상태 관리
    const [reservations, setReservations] = useState<ReservationUIData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // 검색 및 필터 상태
    const [searchForm, setSearchForm] = useState<ReservationFilter>({
        name: "",
        phone: "",
        reservationNumber: "",
        reservationStatus: undefined,
        page: 0,
        size: 15,
        sortBy: "createdAt",
        sortDir: "desc"
    });

    // 페이지네이션 상태 (1부터 시작하는 UI용)
    const [currentPage, setCurrentPage] = useState(1);

    // 예약 데이터 로드 (서버 사이드 페이지네이션)
    const fetchReservations = useCallback(async (filter: ReservationFilter) => {
        if (!eventId) {
            setError('유효하지 않은 이벤트 ID입니다.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response: ReservationListResponse = await reservationService.getReservationAttendees(eventId, filter);

            // 백엔드 데이터를 UI 데이터로 변환
            const uiData = response.content.map(dto => reservationService.transformToUIData(dto));

            setReservations(uiData);
            setTotalElements(response.totalElements);
            setTotalPages(response.totalPages);

        } catch (err) {
            console.error('예약 데이터 로드 실패:', err);
            setError('예약 데이터를 불러오는데 실패했습니다.');
            toast.error('예약 데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    // 컴포넌트 마운트시 데이터 로드
    useEffect(() => {
        fetchReservations(searchForm);
    }, [fetchReservations]);

    // 검색 폼 변경 시 API 호출 (디바운스 적용)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchReservations(searchForm);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchForm, fetchReservations]);

    // 검색 폼 변경 핸들러 (서버 사이드 필터링)
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setSearchForm(prev => ({
            ...prev,
            [name]: value === '' ? undefined : value,
            page: 0 // 검색 시 첫 페이지로 리셋
        }));

        setCurrentPage(1);
    }, []);

    // 검색 조건 초기화
    const handleClearSearch = useCallback(() => {
        const initialForm: ReservationFilter = {
            name: "",
            phone: "",
            reservationNumber: "",
            reservationStatus: undefined,
            page: 0,
            size: 15,
            sortBy: "createdAt",
            sortDir: "desc"
        };
        setSearchForm(initialForm);
        setCurrentPage(1);
    }, []);

    // 페이지네이션 계산 (서버 사이드 기준)
    const startIndex = searchForm.page! * searchForm.size!;
    const endIndex = Math.min(startIndex + reservations.length, totalElements);

    // 페이지 변경 핸들러
    const handlePageChange = useCallback((page: number) => {
        setSearchForm(prev => ({
            ...prev,
            page: page - 1 // UI는 1부터, API는 0부터 시작
        }));
        setCurrentPage(page);
    }, []);

    const handlePrevPage = useCallback(() => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    }, [currentPage, handlePageChange]);

    const handleNextPage = useCallback(() => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    }, [currentPage, totalPages, handlePageChange]);

    // 엑셀 다운로드 함수 (서버사이드 생성)
    const handleExcelDownload = useCallback(async () => {
        if (!eventId) {
            toast.error('유효하지 않은 이벤트 ID입니다.');
            return;
        }

        try {
            setLoading(true);
            await reservationService.downloadAttendeesExcel(eventId, {
                name: searchForm.name,
                phone: searchForm.phone,
                reservationStatus: searchForm.reservationStatus
            });
            toast.success('엑셀 파일 다운로드가 완료되었습니다.');
        } catch (error) {
            console.error('엑셀 다운로드 실패:', error);
            toast.error('엑셀 다운로드에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [eventId, searchForm]);

    // 뒤로 가기 핸들러
    const handleGoBack = useCallback(() => {
        navigate(-1); // 이전 페이지로 이동
    }, [navigate]);

    // eventId가 유효하지 않은 경우 에러 페이지 표시
    if (!eventId) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] min-h-screen relative">
                    <TopNav />
                    <HostSideNav className="!absolute !left-0 !top-[117px]" />

                    <div className="absolute left-64 top-[195px] w-[949px] pb-20">
                        <div className="bg-red-50 border border-red-200 rounded-md p-8 text-center">
                            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-red-800 mb-2">유효하지 않은 이벤트</h2>
                            <p className="text-red-600 mb-4">
                                올바른 이벤트 ID가 필요합니다. URL을 확인해주세요.
                                <br />
                                현재 URL: {window.location.pathname}
                            </p>
                            <button
                                onClick={handleGoBack}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mx-auto"
                            >
                                <ArrowLeft size={16} />
                                뒤로 가기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목과 이벤트 정보 */}
                <div className="top-[137px] left-64 absolute">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleGoBack}
                            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            title="이전 페이지로 돌아가기"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl tracking-[0] leading-[54px] whitespace-nowrap">
                                참가자 목록
                            </h1>
                        </div>
                    </div>
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="ml-64 mt-[220px] w-[949px] pb-20">

                    {/* 검색 영역 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">검색 조건</h3>
                        <div className="grid grid-cols-4 gap-3 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">참가자명</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={searchForm.name || ''}
                                    onChange={handleSearchChange}
                                    placeholder="참가자명 검색"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={searchForm.phone || ''}
                                    onChange={handleSearchChange}
                                    placeholder="연락처 검색"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">예약번호</label>
                                <input
                                    type="text"
                                    name="reservationNumber"
                                    value={searchForm.reservationNumber || ''}
                                    onChange={handleSearchChange}
                                    placeholder="예약번호 검색 (RES-123)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">예약상태</label>
                                <select
                                    name="reservationStatus"
                                    value={searchForm.reservationStatus || ''}
                                    onChange={handleSearchChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={loading}
                                >
                                    <option value="">전체</option>
                                    <option value={RESERVATION_STATUS.PENDING}>{RESERVATION_STATUS_NAMES.PENDING}</option>
                                    <option value={RESERVATION_STATUS.CONFIRMED}>{RESERVATION_STATUS_NAMES.CONFIRMED}</option>
                                    <option value={RESERVATION_STATUS.CANCELLED}>{RESERVATION_STATUS_NAMES.CANCELLED}</option>
                                    <option value={RESERVATION_STATUS.REFUNDED}>{RESERVATION_STATUS_NAMES.REFUNDED}</option>
                                </select>
                            </div>
                        </div>

                        {/* 버튼 영역 */}
                        <div className="flex justify-end items-center">
                            <div className="flex gap-2">
                                <button
                                    onClick={handleExcelDownload}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                                    style={{ borderRadius: '5px' }}
                                >
                                    <Download size={16} />
                                    엑셀 다운로드
                                </button>
                                <button
                                    onClick={handleClearSearch}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                                    style={{ borderRadius: '5px' }}
                                >
                                    검색 초기화
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 로딩 상태 */}
                    {loading && (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">데이터를 불러오는 중...</span>
                        </div>
                    )}

                    {/* 에러 상태 */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                                <span className="text-red-800">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* 테이블 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* 테이블 헤더 */}
                        <div className="bg-gray-50 border-b">
                            <div className="grid gap-2 p-4 items-center w-full" style={{ gridTemplateColumns: '1fr 1.2fr 1fr 1.2fr 1.8fr 0.6fr 0.6fr' }}>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center flex items-center justify-center">참가자명</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center flex items-center justify-center">연락처</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center flex items-center justify-center">예약번호</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center flex items-center justify-center">등록일시</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center flex items-center justify-center">회차정보</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center flex items-center justify-center">예약상태</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center flex items-center justify-center">입장상태</div>
                            </div>
                        </div>

                        {/* 테이블 바디 */}
                        <div>
                            {!loading && !error && reservations.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p>조건에 맞는 예약 데이터가 없습니다.</p>
                                </div>
                            ) : (
                                reservations.map((reservation) => (
                                    <div key={reservation.reservationId} className="border-b hover:bg-gray-50 transition-colors">
                                        <div className="grid gap-2 p-4 items-center w-full" style={{ gridTemplateColumns: '1fr 1.2fr 1fr 1.2fr 1.8fr 0.6fr 0.6fr' }}>
                                            <div className="text-gray-900 text-sm flex items-center justify-center text-center">{reservation.userName}</div>
                                            <div className="text-gray-900 text-sm flex items-center justify-center text-center">{reservation.userPhone}</div>
                                            <div className="text-gray-900 text-sm flex items-center justify-center text-center">{reservation.reservationNumber}</div>
                                            <div className="text-gray-900 text-sm flex items-center justify-center text-center">{reservation.reservationDate}</div>
                                            <div className="text-gray-900 text-sm flex items-center justify-center text-center whitespace-nowrap overflow-hidden text-ellipsis">{reservation.scheduleName || '일정 미정'}</div>
                                            <div className="flex items-center justify-center text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${reservation.paymentStatusColor} ${reservation.paymentStatusTextColor}`}>
                                                    {reservation.reservationStatus}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-center text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${reservation.checkinStatusColor} ${reservation.checkinStatus === '입장완료' ? 'text-green-800' :
                                                    reservation.checkinStatus === '취소' ? 'text-red-800' : 'text-gray-800'
                                                    }`}>
                                                    {reservation.checkinStatus}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* 페이지네이션 */}
                        {!loading && !error && totalElements > 0 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t">
                                <div className="text-sm text-gray-700">
                                    총 {totalElements}건 중 {startIndex + 1}-{endIndex}건 표시
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1 || loading}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === 1 || loading
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        이전
                                    </button>

                                    {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                                        const startPage = Math.max(1, currentPage - 5);
                                        const page = startPage + i;
                                        if (page > totalPages) return null;

                                        return (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                disabled={loading}
                                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === page
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    } ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages || loading}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === totalPages || loading
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        다음
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="h-32 md:h-48" />
            </div>
        </div>
    );
};
