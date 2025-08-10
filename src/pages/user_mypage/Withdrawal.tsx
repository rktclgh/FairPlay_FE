import React, { useState } from "react";
import { TopNav } from "../../components/TopNav";
import { AttendeeSideNav } from "./AttendeeSideNav";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "react-toastify";

export const Withdrawal = () => {
    const navigate = useNavigate();
    const [checkboxes, setCheckboxes] = useState({
        dataDeletion: false,
        dataRetention: false,
        restrictions: false,
        finalAgreement: false
    });
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    const handleCheckboxChange = (key: keyof typeof checkboxes) => {
        setCheckboxes(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const allChecked = Object.values(checkboxes).every(checked => checked);

    const handleWithdrawal = async () => {
        if (!allChecked) {
            toast.error('모든 항목에 동의해야 탈퇴할 수 있습니다.');
            return;
        }

        if (!confirm('정말로 회원탈퇴를 진행하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return;
        }

        setIsWithdrawing(true);
        
        try {
            await api.post('/api/users/mypage/quit');
            
            // 로컬스토리지에서 토큰 삭제
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            
            toast.success('회원탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.');
            
            // 메인 페이지로 리다이렉트
            navigate('/');
        } catch (error) {
            console.error('회원탈퇴 실패:', error);
        } finally {
            setIsWithdrawing(false);
        }
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />
                <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />

                <div className="absolute top-[137px] left-64 w-[949px]">
                    <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl tracking-[0] leading-[54px] whitespace-nowrap mb-8 text-left">
                        회원탈퇴
                    </div>

                    <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-base leading-6 mb-8 text-left">
                        회원탈퇴에 앞서 아래 내용을 반드시 확인해 주세요.
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6 text-left">

                        {/* 데이터 삭제 정보 */}
                        <div className="mb-8">
                            <label className="flex items-start space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={checkboxes.dataDeletion}
                                    onChange={() => handleCheckboxChange('dataDeletion')}
                                    className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-base leading-6">
                                    FairPlay를 탈퇴하면 회원 정보 및 서비스 이용 기록이 삭제됩니다.
                                </span>
                            </label>
                            <div className="ml-7 mt-4 space-y-2">
                                <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-6">
                                    • 내 프로필, 예매/취소 내역, 관심 행사, 찜 목록, 작성한 리뷰 및 문의내역, 사용 중인 포인트 등 모든 정보가 삭제되며, 탈퇴 후 재가입하더라도 복구가 불가능합니다.
                                </div>
                                <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-6">
                                    • 탈퇴 후 14일 이내에는 동일 이메일로 재가입이 불가능합니다.
                                </div>
                            </div>
                        </div>

                        {/* 데이터 보관 정보 */}
                        <div className="mb-8">
                            <label className="flex items-start space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={checkboxes.dataRetention}
                                    onChange={() => handleCheckboxChange('dataRetention')}
                                    className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-base leading-6">
                                    관련 법령 및 내부 기준에 따라 일부 정보는 일정 기간 보관될 수 있습니다.
                                </span>
                            </label>
                            <div className="ml-7 mt-4 space-y-4">
                                <div>
                                    <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-base leading-6 mb-2">
                                        1. 전자상거래 등에서의 소비자 보호에 관한 법률
                                    </div>
                                    <div className="space-y-1">
                                        <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-6">
                                            • 계약 또는 청약철회 등에 관한 기록: 5년
                                        </div>
                                        <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-6">
                                            • 대금결제 및 재화 등의 공급에 관한 기록: 5년
                                        </div>
                                        <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-6">
                                            • 소비자 불만 또는 분쟁처리에 관한 기록: 3년
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-base leading-6 mb-2">
                                        2. 통신비밀보호법
                                    </div>
                                    <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-6">
                                        • 접속 로그 기록: 3개월
                                    </div>
                                </div>
                                <div>
                                    <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-base leading-6 mb-2">
                                        3. 내부 정책에 따른 보존 항목
                                    </div>
                                    <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-6">
                                        • 부정 이용 방지를 위한 이메일, 로그인 이력, 휴대전화번호, CI/DI: 3년 보관
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 탈퇴 제한 정보 */}
                        <div className="mb-0">
                            <label className="flex items-start space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={checkboxes.restrictions}
                                    onChange={() => handleCheckboxChange('restrictions')}
                                    className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-base leading-6">
                                    FairPlay 탈퇴가 제한될 수 있는 경우는 아래 내용을 참고해 주세요.
                                </span>
                            </label>
                            <div className="ml-7 mt-4 space-y-2">
                                <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-6">
                                    • 진행 중인 예매 또는 환불 처리 건이 있는 경우: 해당 절차 완료 후 탈퇴 가능
                                </div>
                                <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-6">
                                    • 남은 포인트가 있는 경우: 모두 소진 또는 소멸 후 탈퇴 가능
                                </div>
                                <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-6">
                                    • 부정 이용이 의심되는 경우: 관련 조치 완료 후 탈퇴 가능
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* 최종 동의 */}
                    <div className="mb-8">
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={checkboxes.finalAgreement}
                                onChange={() => handleCheckboxChange('finalAgreement')}
                                className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-base leading-6">
                                위 안내 내용을 모두 확인하였으며 탈퇴에 동의합니다.
                            </span>
                        </label>
                    </div>

                    {/* 버튼 */}
                    <div className="flex space-x-4 justify-center mt-8">
                        <button
                            onClick={() => navigate('/mypage/info')}
                            className="px-6 py-2 border border-gray-300 rounded-[10px] text-gray-600 bg-white hover:bg-gray-50 transition-colors text-sm"
                        >
                            취소하기
                        </button>
                        <button
                            onClick={handleWithdrawal}
                            disabled={!allChecked || isWithdrawing}
                            className={`px-6 py-2 rounded-[10px] transition-colors text-sm ${allChecked && !isWithdrawing
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {isWithdrawing ? '탈퇴 처리 중...' : '탈퇴하기'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}; 