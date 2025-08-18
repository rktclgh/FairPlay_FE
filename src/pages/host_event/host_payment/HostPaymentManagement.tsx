import React, { useState } from 'react';
import { TopNav } from '../../../components/TopNav';
import { HostSideNav } from '../../../components/HostSideNav';
import HostPaymentSearchFilters from './components/HostPaymentSearchFilters';
import HostPaymentDataTable from './components/HostPaymentDataTable';
import HostPaymentStatisticsCard from './components/HostPaymentStatisticsCard';
import { useHostPaymentManagement } from './hooks/useHostPaymentManagement';
import { toast } from 'react-toastify';

const HostPaymentManagement: React.FC = () => {
  const {
    payments,
    statistics,
    searchCriteria,
    pagination,
    loading,
    setSearchCriteria,
    handleSearch,
    handlePageChange,
    handleSort,
    handleExportExcel,
    refetch
  } = useHostPaymentManagement();

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await handleExportExcel();
      toast.success('엑셀 파일이 다운로드되었습니다.');
    } catch (error) {
      toast.error('엑셀 다운로드 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.info('데이터를 새로고침했습니다.');
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-[1256px] min-h-screen relative">
        <TopNav />

        {/* 페이지 제목 */}
        <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
          결제 관리
        </div>

        {/* 사이드바 */}
        <HostSideNav className="!absolute !left-0 !top-[117px]" />

        {/* 메인 콘텐츠 */}
        <div className="absolute left-64 top-[195px] w-[949px] pb-20 space-y-6">
          <div className="bg-white min-h-screen p-6">
            <div className="max-w-7xl mx-auto">

              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-gray-600">
                    담당 행사의 모든 결제 내역을 관리합니다.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleRefresh}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                    disabled={loading}
                  >
                    🔄 새로고침
                  </button>
                  <button 
                    onClick={handleExport}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    disabled={isExporting || payments.length === 0}
                  >
                    📥 {isExporting ? '내보내는 중...' : '엑셀 다운로드'}
                  </button>
                </div>
              </div>

              {/* 통계 카드 */}
              <HostPaymentStatisticsCard statistics={statistics} />

              {/* 검색 필터 */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">검색 조건</h3>
                <HostPaymentSearchFilters
                  searchCriteria={searchCriteria}
                  onSearchCriteriaChange={setSearchCriteria}
                  onSearch={handleSearch}
                  loading={loading}
                />
              </div>

              {/* 결제 내역 테이블 */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">결제 내역</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        총 {pagination.totalElements?.toLocaleString()}건의 결제 내역
                      </p>
                    </div>
                    {payments.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                          {pagination.currentPage + 1} / {pagination.totalPages} 페이지
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <HostPaymentDataTable
                    payments={payments}
                    pagination={pagination}
                    loading={loading}
                    onPageChange={handlePageChange}
                    onSort={handleSort}
                    searchCriteria={searchCriteria}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostPaymentManagement;