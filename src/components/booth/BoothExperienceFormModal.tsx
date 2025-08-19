import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, FileText, Settings, Save } from 'lucide-react';
import {
  createBoothExperience,
  updateBoothExperience,
  getManageableBooths
} from '../../services/boothExperienceService';
import type {
  BoothExperience,
  BoothExperienceRequest
} from '../../services/types/boothExperienceType';
import { toast } from 'react-toastify';

interface BoothExperienceFormModalProps {
  boothId?: number; // 기존 체험 수정 시에만 사용
  experience?: BoothExperience | null;
  onClose: () => void;
  onSuccess: () => void;
}

const BoothExperienceFormModal: React.FC<BoothExperienceFormModalProps> = ({
  boothId,
  experience,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedBoothId, setSelectedBoothId] = useState<number | null>(boothId || null);
  const [formData, setFormData] = useState<BoothExperienceRequest>({
    title: '',
    description: '',
    experienceDate: '',
    startTime: '09:00:00',
    endTime: '18:00:00',
    durationMinutes: 30,
    maxCapacity: 4,
    allowWaiting: true,
    maxWaitingCount: 10,
    allowDuplicateReservation: false,
    isReservationEnabled: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!experience;

  useEffect(() => {
    if (experience) {
      setFormData({
        title: experience.title,
        description: experience.description,
        experienceDate: experience.experienceDate,
        startTime: experience.startTime,
        endTime: experience.endTime,
        durationMinutes: experience.durationMinutes,
        maxCapacity: experience.maxCapacity,
        allowWaiting: experience.allowWaiting,
        maxWaitingCount: experience.maxWaitingCount,
        allowDuplicateReservation: experience.allowDuplicateReservation,
        isReservationEnabled: experience.isReservationEnabled
      });
      setSelectedBoothId(experience.boothId); // 기존 체험의 부스 ID 설정
    }
  }, [experience]);

  // 관리 가능한 부스 자동 선택 (선택 UI 없음)
  useEffect(() => {
    const loadBooths = async () => {
      try {
        if (!isEditMode && !selectedBoothId) {
          const boothList = await getManageableBooths();
          if (boothList && boothList.length > 0) {
            // 선택 UI가 없으므로 첫 번째 부스를 자동 설정
            setSelectedBoothId(boothList[0].boothId);
          }
        }
      } catch (error) {
        console.error('부스 목록 로딩 실패:', error);
        toast.error('부스 목록을 불러오는데 실패했습니다.');
      }
    };

    loadBooths();
  }, [isEditMode, selectedBoothId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 필수 필드 검증
    if (!formData.title.trim()) {
      newErrors.title = '체험명을 입력해주세요.';
    }

    if (!formData.description.trim()) {
      newErrors.description = '체험 설명을 입력해주세요.';
    }

    if (!formData.experienceDate) {
      newErrors.experienceDate = '체험일을 선택해주세요.';
    }

    if (!formData.startTime) {
      newErrors.startTime = '시작 시간을 선택해주세요.';
    }

    if (!formData.endTime) {
      newErrors.endTime = '종료 시간을 선택해주세요.';
    }

    // 시간 순서 검증
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = '종료 시간은 시작 시간보다 늦어야 합니다.';
    }

    // 숫자 필드 검증
    if (formData.durationMinutes <= 0) {
      newErrors.durationMinutes = '체험 소요 시간은 0보다 커야 합니다.';
    }

    if (formData.maxCapacity <= 0) {
      newErrors.maxCapacity = '동시 체험 가능 인원은 0보다 커야 합니다.';
    }

    if (formData.maxWaitingCount < 0) {
      newErrors.maxWaitingCount = '대기 제한 인원은 0 이상이어야 합니다.';
    }

    // 체험일 과거일 검증 (신규 등록시에만)
    if (!isEditMode && formData.experienceDate) {
      const selectedDate = new Date(formData.experienceDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.experienceDate = '체험일은 오늘 이후여야 합니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (isEditMode && experience) {
        await updateBoothExperience(experience.experienceId, formData);
      } else {
        if (!selectedBoothId) {
          toast.error('등록 가능한 부스가 없습니다.');
          return;
        }
        await createBoothExperience(selectedBoothId, formData);
      }

      onSuccess();
    } catch (error: unknown) {
      console.error('체험 저장 실패:', error);
      let errorMessage = isEditMode ? '체험 수정에 실패했습니다.' : '체험 추가에 실패했습니다.';
      if (typeof error === 'object' && error !== null) {
        const anyErr = error as { response?: { data?: { message?: string } }, message?: string };
        if (anyErr.response?.data?.message) {
          errorMessage = anyErr.response.data.message;
        } else if (anyErr.message) {
          errorMessage = anyErr.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BoothExperienceRequest, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 에러 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-[10px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-[10px]">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="w-6 h-6 mr-3 text-blue-600" />
            {isEditMode ? '체험 수정' : '체험 추가'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* 기본 정보 */}
          <div className="bg-gray-50 rounded-[10px] p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-3 text-blue-600" />
              기본 정보
            </h4>

            <div className="space-y-5">
              {/* 부스 선택 UI 제거 (자동 선택) */}

              {/* 기존 체험 수정 시 부스 정보 표시 */}
              {isEditMode && experience && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    소속 부스
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                    {experience.boothName} ({experience.eventName})
                  </div>
                </div>
              )}

              {/* 체험명 */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  체험명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="체험명을 입력하세요"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  maxLength={100}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* 체험 설명 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  체험 설명 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="체험에 대한 상세한 설명을 입력하세요"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                  <span className="text-xs text-gray-500 ml-auto">
                    {formData.description.length}/500자
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 일정 정보 */}
          <div className="bg-gray-50 rounded-[10px] p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-3 text-blue-600" />
              일정 정보
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 체험일 */}
              <div>
                <label htmlFor="experienceDate" className="block text-sm font-medium text-gray-700 mb-1">
                  체험일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="experienceDate"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.experienceDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  value={formData.experienceDate}
                  onChange={(e) => handleInputChange('experienceDate', e.target.value)}
                />
                {errors.experienceDate && <p className="text-red-500 text-sm mt-1">{errors.experienceDate}</p>}
              </div>

              {/* 시작 시간 */}
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  시작 시간 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="startTime"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.startTime ? 'border-red-300' : 'border-gray-300'
                    }`}
                  value={formData.startTime.substring(0, 5)} // HH:mm 형식으로 변환
                  onChange={(e) => handleInputChange('startTime', e.target.value + ':00')}
                />
                {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
              </div>

              {/* 종료 시간 */}
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  종료 시간 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="endTime"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.endTime ? 'border-red-300' : 'border-gray-300'
                    }`}
                  value={formData.endTime.substring(0, 5)} // HH:mm 형식으로 변환
                  onChange={(e) => handleInputChange('endTime', e.target.value + ':00')}
                />
                {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
              </div>
            </div>
          </div>

          {/* 운영 정보 */}
          <div className="bg-gray-50 rounded-[10px] p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
              <Users className="w-5 h-5 mr-3 text-blue-600" />
              운영 정보
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 체험 소요 시간 */}
              <div>
                <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-700 mb-1">
                  체험 소요 시간 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="durationMinutes"
                    min="1"
                    max="600"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.durationMinutes ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="30"
                    value={formData.durationMinutes}
                    onChange={(e) => handleInputChange('durationMinutes', parseInt(e.target.value) || 0)}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">분</span>
                </div>
                {errors.durationMinutes && <p className="text-red-500 text-sm mt-1">{errors.durationMinutes}</p>}
              </div>

              {/* 동시 체험 가능 인원 */}
              <div>
                <label htmlFor="maxCapacity" className="block text-sm font-medium text-gray-700 mb-1">
                  동시 체험 가능 인원 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="maxCapacity"
                    min="1"
                    max="100"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.maxCapacity ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="4"
                    value={formData.maxCapacity}
                    onChange={(e) => handleInputChange('maxCapacity', parseInt(e.target.value) || 0)}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">명</span>
                </div>
                {errors.maxCapacity && <p className="text-red-500 text-sm mt-1">{errors.maxCapacity}</p>}
              </div>

              {/* 대기 제한 인원 */}
              <div>
                <label htmlFor="maxWaitingCount" className="block text-sm font-medium text-gray-700 mb-1">
                  대기 제한 인원
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="maxWaitingCount"
                    min="0"
                    max="200"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.maxWaitingCount ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="10"
                    value={formData.maxWaitingCount}
                    onChange={(e) => handleInputChange('maxWaitingCount', parseInt(e.target.value) || 0)}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">명</span>
                </div>
                {errors.maxWaitingCount && <p className="text-red-500 text-sm mt-1">{errors.maxWaitingCount}</p>}
              </div>
            </div>
          </div>

          {/* 예약 설정 */}
          <div className="bg-gray-50 rounded-[10px] p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-3 text-blue-600" />
              예약 설정
            </h4>

            <div className="space-y-6">
              {/* 대기열 허용 여부 */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">대기열 허용</label>
                  <p className="text-xs text-gray-500">정원 초과 시 대기열 등록을 허용합니다.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.allowWaiting}
                    onChange={(e) => handleInputChange('allowWaiting', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* 중복 예약 허용 여부 */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">중복 예약 허용</label>
                  <p className="text-xs text-gray-500">같은 사용자가 여러 번 예약할 수 있습니다.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.allowDuplicateReservation}
                    onChange={(e) => handleInputChange('allowDuplicateReservation', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* 예약 활성 여부 */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">예약 활성화</label>
                  <p className="text-xs text-gray-500">체험 예약을 받을 수 있도록 활성화합니다.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.isReservationEnabled}
                    onChange={(e) => handleInputChange('isReservationEnabled', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex space-x-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 rounded-[10px] font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-[10px] hover:bg-blue-50 hover:border-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-medium shadow-sm"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? '수정하기' : '추가하기'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BoothExperienceFormModal;