import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhone: string;
  currentNickname: string;
  onSuccess: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentPhone,
  currentNickname,
  onSuccess
}) => {
  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [nicknameCheckResult, setNicknameCheckResult] = useState<{
    checked: boolean;
    available: boolean;
    message: string;
  }>({ checked: false, available: false, message: '' });

  useEffect(() => {
    if (isOpen) {
      setPhone(currentPhone);
      setNickname(currentNickname);
      // 모달이 열릴 때 중복확인 상태 초기화
      setNicknameCheckResult({ checked: false, available: false, message: '' });
    }
  }, [isOpen, currentPhone, currentNickname]);

  // 닉네임 중복확인 함수
  const checkNicknameDuplicate = async () => {
    if (!nickname.trim()) {
      toast.error('닉네임을 입력해주세요.');
      return;
    }

    if (nickname === currentNickname) {
      setNicknameCheckResult({
        checked: true,
        available: true,
        message: '현재 사용 중인 닉네임입니다.'
      });
      return;
    }

    setIsCheckingNickname(true);

    try {
      const response = await api.get('/api/users/check-nickname', {
        params: {
          nickname: nickname
        }
      });

      // 백엔드에서 duplicate: true면 중복됨, false면 사용 가능
      const isDuplicated = response.data.duplicate;

      if (!isDuplicated) {
        setNicknameCheckResult({
          checked: true,
          available: true,
          message: '사용 가능한 닉네임입니다.'
        });
        toast.success('사용 가능한 닉네임입니다.');
      } else {
        setNicknameCheckResult({
          checked: true,
          available: false,
          message: '이미 사용 중인 닉네임입니다.'
        });
        toast.error('이미 사용 중인 닉네임입니다.');
      }
    } catch (error) {
      console.error('닉네임 중복확인 실패:', error);
      setNicknameCheckResult({
        checked: false,
        available: false,
        message: '중복확인 중 오류가 발생했습니다.'
      });
      toast.error('중복확인 중 오류가 발생했습니다.');
    } finally {
      setIsCheckingNickname(false);
    }
  };

  // 닉네임 변경 시 중복확인 상태 초기화
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    if (nicknameCheckResult.checked) {
      setNicknameCheckResult({ checked: false, available: false, message: '' });
    }
  };

  // 휴대폰 번호 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');

    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim() || !nickname.trim()) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }

    if (phone.length !== 13) {
      toast.error('올바른 휴대폰 번호를 입력해주세요.');
      return;
    }

    // 닉네임이 변경되었고 중복확인을 하지 않은 경우
    if (nickname !== currentNickname && !nicknameCheckResult.checked) {
      toast.error('닉네임 중복확인을 해주세요.');
      return;
    }

    // 닉네임이 변경되었고 중복확인 결과가 사용 불가능한 경우
    if (nickname !== currentNickname && nicknameCheckResult.checked && !nicknameCheckResult.available) {
      toast.error('사용할 수 없는 닉네임입니다.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/users/mypage/edit', {
        phone: phone,
        nickname: nickname
      });

      toast.success('개인정보가 수정되었습니다.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('개인정보 수정 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-[10px] shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">개인정보 수정</h2>
        </div>

        {/* 모달 바디 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              닉네임
            </label>
            <div className="relative">
              <input
                type="text"
                value={nickname}
                onChange={handleNicknameChange}
                placeholder="닉네임을 입력하세요"
                maxLength={20}
                className="w-full h-11 px-4 pr-20 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={checkNicknameDuplicate}
                disabled={loading || isCheckingNickname || !nickname.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded border hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingNickname ? '확인중...' : '중복확인'}
              </button>
            </div>
            {nicknameCheckResult.checked && (
              <p className={`text-xs mt-1 ${nicknameCheckResult.available ? 'text-green-600' : 'text-red-600'}`}>
                {nicknameCheckResult.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              휴대폰 번호
            </label>
            <input
              type="text"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="010-0000-0000"
              maxLength={13}
              className="w-full h-11 px-4 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={loading}
              required
            />
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-[10px] text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-black text-white rounded-[10px] text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none disabled:opacity-50"
            >
              {loading ? '수정 중...' : '수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};