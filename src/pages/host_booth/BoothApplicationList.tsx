import React, { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";
import { Download } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import * as XLSX from 'xlsx';
import { getBoothApplications } from "../../api/boothApi";
import { BoothApplication } from "../../types/booth"; // Assuming this type matches the list DTO

// NOTE: The backend DTO for the list might be different from the full BoothApplication type.
// This component assumes the list DTO has at least these fields.
// You may need to create a specific `BoothApplicationListDto` type.
interface BoothApplicationRow extends BoothApplication {
    applicationNumber: string;
    processStatus: string;
    processStatusColor: string;
    processStatusTextColor: string;
    paymentStatus: string;
    paymentStatusColor: string;
    paymentStatusTextColor: string;
    applicationDate: string;
}

export const BoothApplicationList = () => {
    const navigate = useNavigate();
    const { eventId } = useParams<{ eventId: string }>();

    const [applications, setApplications] = useState<BoothApplicationRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [searchForm, setSearchForm] = useState({
        applicationNumber: "",
        boothName: "",
        boothType: ""
    });

    useEffect(() => {
        if (eventId) {
            setLoading(true);
            getBoothApplications(parseInt(eventId))
                .then(data => {
                    // Map backend data to the format expected by the table
                    const formattedData = data.map((app: any) => ({
                        ...app, // Spread the original data
                        id: app.applicationId,
                        applicationNumber: `BOOTH-${new Date(app.applyAt).getFullYear()}-${String(app.applicationId).padStart(3, '0')}`,
                        boothName: app.boothTitle,
                        boothType: app.boothTypeName,
                        applicationDate: new Date(app.applyAt).toLocaleString(),
                        processStatus: app.applicationStatus, // TODO: Map to color
                        paymentStatus: app.paymentStatus, // TODO: Map to color
                        applicantName: app.managerName,
                        contact: app.contactNumber,
                    }));
                    setApplications(formattedData);
                    setLoading(false);
                })
                .catch(err => {
                    setError("신청 목록을 불러오는 데 실패했습니다.");
                    setLoading(false);
                    console.error(err);
                });
        }
    }, [eventId]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Search form change handler
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSearchForm(prev => ({
            ...prev,
            [name]: value
        }));
        setCurrentPage(1); // Reset to first page on search
    };

    // Filtered data
    const filteredApplications = applications.filter(application => {
        const matchesApplicationNumber = !searchForm.applicationNumber || 
            application.applicationNumber.toLowerCase().includes(searchForm.applicationNumber.toLowerCase());
        const matchesBoothName = !searchForm.boothName || 
            application.boothName.toLowerCase().includes(searchForm.boothName.toLowerCase());
        const matchesBoothType = !searchForm.boothType || 
            application.boothType === searchForm.boothType;
        
        return matchesApplicationNumber && matchesBoothName && matchesBoothType;
    });

    // Pagination calculation
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentApplications = filteredApplications.slice(startIndex, endIndex);

    // Page change handlers
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

    // Excel download function
    const handleExcelDownload = () => {
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

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        const colWidths = [
            { wch: 6 }, { wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 18 }, 
            { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 }
        ];
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, '부스 신청 목록');

        const today = new Date();
        const dateString = today.getFullYear() + 
                          String(today.getMonth() + 1).padStart(2, '0') + 
                          String(today.getDate()).padStart(2, '0');
        const fileName = `부스신청목록_${dateString}.xlsx`;

        XLSX.writeFile(wb, fileName);
    };

    const handleViewDetail = (applicationId: number) => {
        navigate(`/host/events/${eventId}/booth-applications/${applicationId}`);
    };

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    부스 신청 목록
                </div>
                <HostSideNav className="!absolute !left-0 !top-[117px]" />
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">검색 조건</h3>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">신청번호</label>
                                <input type="text" name="applicationNumber" value={searchForm.applicationNumber} onChange={handleSearchChange} placeholder="신청번호 검색" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">부스명</label>
                                <input type="text" name="boothName" value={searchForm.boothName} onChange={handleSearchChange} placeholder="부스명 검색" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">부스타입</label>
                                <select name="boothType" value={searchForm.boothType} onChange={handleSearchChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="">전체</option>
                                    {/* TODO: Populate from API if dynamic */}
                                    <option value="스탠다드 부스">스탠다드 부스</option>
                                    <option value="프리미엄 부스">프리미엄 부스</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={handleExcelDownload} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                                <Download size={16} />
                                엑셀 다운로드
                            </button>
                        </div>
                    </div>
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            총 <span className="font-semibold text-blue-600">{filteredApplications.length}</span>건의 부스 신청이 있습니다.
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="bg-gray-50 border-b">
                            <div className="grid gap-4 p-4 items-center" style={{ gridTemplateColumns: '120px 180px 100px 130px 90px 90px 100px' }}>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left">신청번호</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left">부스명</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left">부스타입</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left">신청일시</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left">처리상태</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left">결제상태</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-left">상세보기</div>
                            </div>
                        </div>
                        <div>
                            {currentApplications.map((application) => (
                                <div key={application.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <div className="grid gap-4 p-4 items-center" style={{ gridTemplateColumns: '120px 180px 100px 130px 90px 90px 100px' }}>
                                        <div className="text-gray-900 text-sm truncate">{application.applicationNumber}</div>
                                        <div className="text-gray-900 text-sm truncate" title={application.boothName}>{application.boothName}</div>
                                        <div className="text-gray-900 text-sm">{application.boothType}</div>
                                        <div className="text-gray-900 text-sm">{application.applicationDate}</div>
                                        <div>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium`}>
                                                {application.processStatus}
                                            </span>
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium`}>
                                                {application.paymentStatus}
                                            </span>
                                        </div>
                                        <div>
                                            <button onClick={() => handleViewDetail(application.id)} className="px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors focus:outline-none text-sm font-medium border border-blue-200 hover:border-blue-300">
                                                상세보기
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between px-6 py-4 border-t">
                            <div className="text-sm text-gray-700">
                                총 {filteredApplications.length}건 중 {startIndex + 1}-{Math.min(endIndex, filteredApplications.length)}건 표시
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={handlePrevPage} disabled={currentPage === 1} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                                    이전
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button key={page} onClick={() => handlePageChange(page)} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                                        {page}
                                    </button>
                                ))}
                                <button onClick={handleNextPage} disabled={currentPage === totalPages} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
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
