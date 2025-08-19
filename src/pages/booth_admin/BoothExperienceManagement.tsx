import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Calendar, Clock, Edit, Trash2,
    RefreshCw, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import {
    getManageableExperiences,
    getExperienceDetail,
    deleteBoothExperience,
    formatTime
} from '../../services/boothExperienceService';
import type { BoothExperience } from '../../services/types/boothExperienceType';
import { toast } from 'react-toastify';
import BoothExperienceFormModal from '../../components/booth/BoothExperienceFormModal';
import { TopNav } from "../../components/TopNav";
import { BoothAdminSideNav } from "../../components/BoothAdminSideNav";

const BoothExperienceManagement: React.FC = () => {
    const navigate = useNavigate();
    const [experiences, setExperiences] = useState<BoothExperience[]>([]);
    const [filteredExperiences, setFilteredExperiences] = useState<BoothExperience[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingExperience, setEditingExperience] = useState<BoothExperience | null>(null);

    // 필터 상태
    const [searchTitle, setSearchTitle] = useState('');
    const [searchDate, setSearchDate] = useState('');

    useEffect(() => {
        loadExperiences();
    }, []);

    useEffect(() => {
        filterExperiences();
    }, [experiences, searchTitle, searchDate]);

    const loadExperiences = async () => {
        try {
            setLoading(true);
            const data = await getManageableExperiences();

            // API 데이터가 없으면 더미 데이터 표시
            if (!data || data.length === 0) {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                const dateStr = `${yyyy}-${mm}-${dd}`;

                const dummyExperiences: BoothExperience[] = [
                    {
                        experienceId: 1,
                        boothId: 1,
                        eventId: 1,
                        boothName: '더미 부스 A',
                        eventName: '더미 이벤트',
                        title: '더미 체험 A',
                        description: '샘플 설명입니다. 실제 데이터가 오면 대체됩니다.',
                        experienceDate: dateStr,
                        startTime: '10:00:00',
                        endTime: '11:00:00',
                        durationMinutes: 30,
                        maxCapacity: 10,
                        currentParticipants: 3,
                        waitingCount: 2,
                        allowWaiting: true,
                        maxWaitingCount: 10,
                        allowDuplicateReservation: false,
                        isReservationEnabled: true,
                        isReservationAvailable: true,
                        congestionRate: 0.3,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        experienceId: 2,
                        boothId: 1,
                        eventId: 1,
                        boothName: '더미 부스 A',
                        eventName: '더미 이벤트',
                        title: '더미 체험 B',
                        description: '샘플 설명입니다. 실제 데이터가 오면 대체됩니다.',
                        experienceDate: dateStr,
                        startTime: '14:00:00',
                        endTime: '15:30:00',
                        durationMinutes: 45,
                        maxCapacity: 12,
                        currentParticipants: 5,
                        waitingCount: 0,
                        allowWaiting: true,
                        maxWaitingCount: 8,
                        allowDuplicateReservation: false,
                        isReservationEnabled: true,
                        isReservationAvailable: true,
                        congestionRate: 0.42,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                ];
                setExperiences(dummyExperiences);
            } else {
                setExperiences(data);
            }
        } catch (error) {
            console.error('체험 목록 로딩 실패:', error);
            toast.error('체험 목록을 불러오는데 실패했습니다.');
            setExperiences([]); // 에러 발생 시 빈 배열로 설정
        } finally {
            setLoading(false);
        }
    };

    const filterExperiences = () => {
        let filtered = [...experiences];

        // 체험명 및 부스명 검색
        if (searchTitle.trim()) {
            filtered = filtered.filter(exp =>
                exp.title.toLowerCase().includes(searchTitle.toLowerCase()) ||
                (exp.boothName && exp.boothName.toLowerCase().includes(searchTitle.toLowerCase()))
            );
        }

        // 체험일 검색
        if (searchDate) {
            filtered = filtered.filter(exp => exp.experienceDate === searchDate);
        }

        // 등록일시 기준 내림차순 정렬 (최신순)
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setFilteredExperiences(filtered);
    };

    const handleAddExperience = () => {
        setEditingExperience(null);
        setShowFormModal(true);
    };

    // 체험 수정
    const handleEditExperience = async (experience: BoothExperience) => {
        try {
            // 최신 데이터를 백엔드에서 가져오기
            const latestData = await getExperienceDetail(experience.experienceId);
            setEditingExperience(latestData);
            setShowFormModal(true);
        } catch (error) {
            console.error('체험 정보 로딩 실패:', error);
            toast.error('체험 정보를 불러오는데 실패했습니다.');
        }
    };

    // 체험 상세보기
    const handleViewExperienceDetail = (experience: BoothExperience) => {
        console.log('체험 상세보기 클릭:', experience.experienceId);
        navigate(`/booth-admin/experience-detail/${experience.experienceId}`);
    };

    const handleFormSubmitSuccess = () => {
        setShowFormModal(false);
        setEditingExperience(null);
        loadExperiences(); // 목록 새로고침
        toast.success(editingExperience ? '체험이 수정되었습니다.' : '체험이 추가되었습니다.');
    };

    const handleDeleteExperience = async (experienceId: number) => {
        if (!confirm('정말로 이 체험을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await deleteBoothExperience(experienceId);
            toast.success('체험이 삭제되었습니다.');
            loadExperiences();
        } catch (error) {
            console.error('체험 삭제 실패:', error);
            toast.error('체험 삭제에 실패했습니다.');
        }
    };

    const resetFilters = () => {
        setSearchTitle('');
        setSearchDate('');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    체험 관리
                </div>

                {/* 사이드바 */}
                <BoothAdminSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">
                    {/* 헤더 */}
                    <div className="mb-6">
                        <p className="text-gray-600">부스에서 제공하는 체험들을 관리하세요</p>
                    </div>

                    {/* 필터 및 검색 */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex flex-wrap items-end gap-4 mb-4">
                            {/* 체험명/부스명 검색 */}
                            <div className="flex-1 min-w-[200px]">
                                <label htmlFor="searchTitle" className="block text-sm font-medium text-gray-700 mb-1">
                                    체험명/부스명
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="searchTitle"
                                        className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="체험명 또는 부스명 검색"
                                        value={searchTitle}
                                        onChange={(e) => setSearchTitle(e.target.value)}
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                </div>
                            </div>

                            {/* 체험일 검색 */}
                            <div className="flex-1 min-w-[180px]">
                                <label htmlFor="searchDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    체험일
                                </label>
                                <input
                                    type="date"
                                    id="searchDate"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={searchDate}
                                    onChange={(e) => setSearchDate(e.target.value)}
                                />
                            </div>

                            {/* 검색 버튼 */}
                            <button
                                onClick={filterExperiences}
                                className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center h-[38px]"
                            >
                                <Search className="w-4 h-4 mr-2" /> 검색
                            </button>
                            {/* 초기화 버튼 */}
                            {(searchTitle || searchDate) && (
                                <button
                                    onClick={resetFilters}
                                    className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md transition-colors flex items-center justify-center h-[38px]"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" /> 초기화
                                </button>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleAddExperience}
                                className="border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-[10px] hover:bg-blue-50 transition-colors flex items-center"
                            >
                                <Plus className="w-5 h-5 mr-2" /> 체험 추가하기
                            </button>
                        </div>
                    </div>

                    {/* 체험 목록 테이블 */}
                    {filteredExperiences.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg font-semibold">등록된 체험이 없습니다.</p>
                            <p className="text-sm mt-2">새로운 체험을 추가해보세요!</p>
                            <button
                                onClick={handleAddExperience}
                                className="mt-4 border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-[10px] hover:bg-blue-50 transition-colors"
                            >
                                체험 추가하기
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full divide-y divide-gray-200 table-fixed">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                                            체험 정보
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                                            일정
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                                            운영 정보
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                                            상태
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                                            등록일시
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                            작업
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredExperiences.map((experience) => (
                                        <tr key={experience.experienceId} className="hover:bg-gray-50">
                                            {/* 체험 정보 */}
                                            <td className="px-6 py-4 w-1/5 text-center">
                                                <div className="min-w-0">
                                                    <button
                                                        onClick={() => handleViewExperienceDetail(experience)}
                                                        className="text-center w-full hover:bg-blue-50 p-2 rounded transition-colors group"
                                                    >
                                                        <div className="text-sm font-medium text-gray-900 mb-1 truncate group-hover:text-blue-600" title={experience.title}>
                                                            {experience.title}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            클릭하여 상세보기
                                                        </div>
                                                    </button>
                                                </div>
                                            </td>

                                            {/* 일정 */}
                                            <td className="px-6 py-4 w-1/5 text-center">
                                                <div className="text-sm text-gray-900">
                                                    <div className="flex items-center justify-center mb-1">
                                                        <Calendar className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
                                                        <span className="truncate">{new Date(experience.experienceDate).toLocaleDateString('ko-KR')}</span>
                                                    </div>
                                                    <div className="flex items-center justify-center">
                                                        <Clock className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
                                                        <span className="truncate">{formatTime(experience.startTime)} - {formatTime(experience.endTime)}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 운영 정보 */}
                                            <td className="px-6 py-4 w-1/5 text-center">
                                                <div className="text-sm text-gray-900">
                                                    <div className="mb-1">
                                                        소요시간: <span className="font-medium">{experience.durationMinutes}분</span>
                                                    </div>
                                                    <div className="mb-1">
                                                        동시참여: <span className="font-medium">{experience.maxCapacity}명</span>
                                                    </div>
                                                    <div>
                                                        대기제한: <span className="font-medium">{experience.maxWaitingCount}명</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 상태 */}
                                            <td className="px-6 py-4 w-1/5 text-center">
                                                <div className="flex items-center justify-center">
                                                    {experience.isReservationEnabled ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                                                    )}
                                                    <span className={`text-sm font-medium ${experience.isReservationEnabled ? 'text-green-600' : 'text-red-600'}`}>
                                                        {experience.isReservationEnabled ? '예약 활성' : '예약 비활성'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* 등록일시 */}
                                            <td className="px-6 py-4 w-1/5 text-center">
                                                <div className="text-sm text-gray-900">
                                                    <div>{new Date(experience.createdAt).toLocaleDateString('ko-KR')}</div>
                                                    <div className="text-xs text-gray-500">{new Date(experience.createdAt).toLocaleTimeString('ko-KR')}</div>
                                                </div>
                                            </td>

                                            {/* 작업 버튼 */}
                                            <td className="px-6 py-4 text-center w-20">
                                                <div className="flex justify-center space-x-2">
                                                    <button
                                                        onClick={() => handleEditExperience(experience)}
                                                        className="text-blue-600 hover:text-blue-800 p-1 flex-shrink-0"
                                                        title="수정"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteExperience(experience.experienceId)}
                                                        className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"
                                                        title="삭제"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* 체험 추가/수정 모달 */}
            {showFormModal && (
                <BoothExperienceFormModal
                    boothId={editingExperience ? editingExperience.boothId : undefined}
                    experience={editingExperience}
                    onClose={() => setShowFormModal(false)}
                    onSuccess={handleFormSubmitSuccess}
                />
            )}
        </div>
    );
};

export default BoothExperienceManagement;
