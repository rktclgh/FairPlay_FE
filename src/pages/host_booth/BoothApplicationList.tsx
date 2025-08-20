import React, { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { Download } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import * as XLSX from 'xlsx';
import { getBoothApplications } from "../../api/boothApi";
import { BoothApplicationList as BoothApplicationListType } from "../../types/booth";

export const BoothApplicationList = () => {
    const navigate = useNavigate();
    const { eventId } = useParams<{ eventId: string }>();

    const [searchForm, setSearchForm] = useState({
        applicationNumber: "",
        boothName: "",
        boothType: ""
    });

    // 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // 부스 신청 데이터
    const [applications, setApplications] = useState<BoothApplicationListType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 백엔드에서 데이터 로드
    useEffect(() => {
        if (eventId) {
            setLoading(true);
            getBoothApplications(Number(eventId))
                .then(data => {
                    console.log("data", data);
                    setApplications(data);
                    setLoading(false);
                })
                .catch(err => {
                    setError('부스 신청 목록을 불러오는 데 실패했습니다.');
                    setLoading(false);
                    console.error(err);
                });
        }
    }, [eventId]);

    // 상태에 따른 색상 반환
    const getStatusColors = (statusCode: string) => {
        switch (statusCode) {
            case 'APPROVED':
                return { bg: 'bg-emerald-100', text: 'text-emerald-800' };
            case 'REJECTED':
                return { bg: 'bg-red-100', text: 'text-red-800' };
            case 'PENDING':
                return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-800' };
        }
    };

    const getPaymentStatusColors = (paymentStatus: string) => {
        switch (paymentStatus) {
            case 'PAID':
            case '결제완료':
            case '결제 완료':
                return { bg: 'bg-green-100', text: 'text-green-800' };
            case 'CANCELLED':
            case '결제취소':
            case '부스 신청 취소':
                return { bg: 'bg-red-100', text: 'text-red-800' };
            case 'PENDING':
            case '결제 대기':
            case '결제대기':
            case '결제 전':
                return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
            case 'UNPAID':
            case '미결제':
                return { bg: 'bg-gray-100', text: 'text-gray-800' };
            case 'REFUNDED':
            case '환불완료':
                return { bg: 'bg-purple-100', text: 'text-purple-800' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-800' };
        }
    };

    // 필터링 함수
    const filteredApplications = applications.filter(application => {
        return (
            (searchForm.boothName === "" || application.boothTitle.toLowerCase().includes(searchForm.boothName.toLowerCase())) &&
            (searchForm.boothType === "" || application.boothTypeName.toLowerCase().includes(searchForm.boothType.toLowerCase()))
        );
    });

    // 페이지네이션
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentApplications = filteredApplications.slice(startIndex, endIndex);

    // 검색 폼 변경 핸들러
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSearchForm(prev => ({
            ...prev,
            [name]: value
        }));
        setCurrentPage(1); // 검색 시 첫 페이지로 리셋
    };

    // 페이지네이션 핸들러
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

    // 엑셀 다운로드
    const handleExcelDownload = () => {
        const excelData = filteredApplications.map((application, index) => ({
            "순번": index + 1,
            "부스명": application.boothTitle,
            "부스타입": application.boothTypeName,
            "신청일시": new Date(application.applyAt).toLocaleString('ko-KR'),
            "처리상태": application.statusName,
            "결제상태": application.paymentStatus,
            "신청자명": application.managerName,
            "담당자이메일": application.contactEmail
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "부스신청목록");
        XLSX.writeFile(wb, `부스신청목록_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleViewDetail = (applicationId: number) => {
        navigate(`/host/events/${eventId}/booth-applications/${applicationId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <TopNav />
                <div className="flex">
                    <HostSideNav />
                    <div className="flex-1 p-8">
                        <div className="text-center">로딩 중...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <TopNav />
                <div className="flex">
                    <HostSideNav />
                    <div className="flex-1 p-8">
                        <div className="text-center text-red-600">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    부스 신청 목록
                </div>

                {/* 사이드바 */}
                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="ml-64 mt-[195px] w-[949px] pb-20">

                    {/* 검색 영역 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">검색 조건</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">부스명</label>
                                <input
                                    type="text"
                                    name="boothName"
                                    value={searchForm.boothName}
                                    onChange={handleSearchChange}
                                    placeholder="부스명 검색"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">부스타입</label>
                                <input
                                    type="text"
                                    name="boothType"
                                    value={searchForm.boothType}
                                    onChange={handleSearchChange}
                                    placeholder="부스타입 검색"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 상단 통계 및 액션 버튼 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between items-center">
                            <div className="text-gray-700">
                                총 <span className="font-semibold text-blue-600">{filteredApplications.length}</span>건의 부스 신청이 있습니다.
                            </div>
                            <button
                                onClick={handleExcelDownload}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                엑셀 다운로드
                            </button>
                        </div>
                    </div>

                    {/* 테이블 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* 테이블 헤더 */}
                        <div className="bg-gray-50 border-b">
                            <div className="grid gap-4 p-4 items-center" style={{ gridTemplateColumns: '200px 100px 120px 100px 120px 125px' }}>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left">부스명</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center">부스타입</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center">신청일시</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center">처리상태</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center">결제상태</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-right">상세보기</div>
                            </div>
                        </div>

                        {/* 테이블 바디 */}
                        <div>
                            {currentApplications.map((application) => {
                                const statusColors = getStatusColors(application.statusCode);
                                const paymentColors = getPaymentStatusColors(application.paymentStatus);
                                
                                return (
                                    <div key={application.boothApplicationId} className="border-b hover:bg-gray-50 transition-colors">
                                        <div className="grid gap-4 p-4 items-center" style={{ gridTemplateColumns: '200px 100px 120px 100px 120px 140px' }}>
                                            <div className="text-gray-900 text-sm text-left truncate" title={application.boothTitle}>
                                                {application.boothTitle}
                                            </div>
                                            <div className="text-gray-900 text-sm text-center">
                                                {application.boothTypeName}
                                            </div>
                                            <div className="text-gray-900 text-sm text-center whitespace-pre-line leading-tight">
                                                {new Date(application.applyAt).toLocaleString('ko-KR').replace(/(오전|오후)/, '\n$1')}
                                            </div>
                                            <div className="flex items-center justify-center">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors.bg} ${statusColors.text}`}>
                                                    {application.statusName}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-center">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${paymentColors.bg} ${paymentColors.text}`}>
                                                    {application.paymentStatus}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-end">
                                                <button
                                                    onClick={() => handleViewDetail(application.boothApplicationId)}
                                                    className="px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors focus:outline-none text-sm font-medium border border-blue-200 hover:border-blue-300 whitespace-nowrap flex justify-end"
                                                    title="상세보기"
                                                >
                                                    상세보기
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
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