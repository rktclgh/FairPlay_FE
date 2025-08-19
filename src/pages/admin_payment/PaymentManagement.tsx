import React, { useState, useEffect } from 'react';
import { TopNav } from '../../components/TopNav';
import { AdminSideNav } from '../../components/AdminSideNav';
import PaymentSearchFilters from './components/PaymentSearchFilters';
import PaymentDataTable from './components/PaymentDataTable';
import PaymentStatisticsCard from './components/PaymentStatisticsCard';
import { usePaymentManagement } from './hooks/usePaymentManagement';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const PaymentManagement: React.FC = () => {
  const { t } = useTranslation();
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
  } = usePaymentManagement();

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await handleExportExcel();
      toast.success(t('payment.downloadSuccess'));
    } catch (error) {
      toast.error(t('payment.downloadError'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.info(t('payment.refreshSuccess'));
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-[1256px] min-h-screen relative">
        <TopNav />

        {/* 페이지 제목 */}
        <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
          {t('payment.management')}
        </div>

        {/* 사이드바 */}
        <AdminSideNav className="!absolute !left-0 !top-[117px]" />

        {/* 메인 콘텐츠 */}
        <div className="absolute left-64 top-[195px] w-[949px] pb-20 space-y-6">
          <div className="bg-white min-h-screen p-6">
            <div className="max-w-7xl mx-auto">

              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-gray-600">
                    {t('payment.description')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleRefresh}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                    disabled={loading}
                  >
                    🔄 {t('payment.refresh')}
                  </button>
                  <button 
                    onClick={handleExport}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    disabled={isExporting || payments.length === 0}
                  >
                    📥 {isExporting ? t('payment.exporting') : t('payment.excelDownload')}
                  </button>
                </div>
              </div>

              {/* 통계 카드 */}
              <PaymentStatisticsCard statistics={statistics} />

              {/* 검색 필터 */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">{t('payment.searchConditions')}</h3>
                <PaymentSearchFilters
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
                      <h3 className="text-lg font-semibold">{t('payment.paymentHistory')}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {t('common.total')} {pagination.totalElements?.toLocaleString()}{t('payment.totalPayments')}
                      </p>
                    </div>
                    {payments.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                          {pagination.currentPage + 1} / {pagination.totalPages} {t('payment.page')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <PaymentDataTable
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

export default PaymentManagement;