import React, { useState, useEffect } from "react";
import { AttendeeSideNav } from "./AttendeeSideNav";
import { TopNav } from "../../components/TopNav";
import { useNavigate } from "react-router-dom";
import { eventApi } from "../../services/api";
import type { UserInfo, PasswordChangeRequest } from "../../services/api";
import { EditProfileModal } from "../../components/EditProfileModal";
import { useTranslation } from "react-i18next";

// 블러 처리 유틸리티 함수들
const blurEmail = (email: string) => {
    if (!email) return "";
    const [localPart, domain] = email.split('@');
    if (!domain) return email;

    const visibleChars = Math.min(2, localPart.length);
    const blurredPart = '•'.repeat(localPart.length - visibleChars);
    return `${localPart.substring(0, visibleChars)}${blurredPart}@${domain}`;
};

const blurPassword = (password: string) => {
    if (!password) return "";
    return '●'.repeat(password.length);
};

const formatPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return "";
    // 전화번호가 이미 포맷팅되어 있으면 그대로 반환
    if (phoneNumber.includes('-')) return phoneNumber;

    const cleaned = phoneNumber.replace(/[^0-9]/g, '');
    if (cleaned.length === 11) {
        return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 7)}-${cleaned.substring(7)}`;
    }
    return phoneNumber;
};

export const MyPageInfo = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // 사용자 정보 상태
    const [userInfo, setUserInfo] = useState<UserInfo>({
        userId: 0,
        email: "",
        phone: "",
        name: "",
        nickname: "",
        role: ""
    });

    // 로딩 상태
    const [isLoading, setIsLoading] = useState(true);

    // 블러 처리된 데이터들
    const [blurredData, setBlurredData] = useState({
        email: "",
        password: "",
        phone: ""
    });

    // 비밀번호 변경 폼 표시 상태
    const [showPasswordChange, setShowPasswordChange] = useState(false);

    // 비밀번호 입력 상태
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // 비밀번호 변경 상태
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    // 개인정보 수정 모달 상태
    const [showEditModal, setShowEditModal] = useState(false);

    // 사용자 정보 로드
    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                setIsLoading(true);
                const userData = await eventApi.getUserInfo();
                setUserInfo(userData);
            } catch (error) {
                console.error("사용자 정보 로드 실패:", error);
                // 로그인이 필요한 경우 로그인 페이지로 리다이렉트
                if (error instanceof Error && error.message === '로그인이 필요합니다.') {
                    alert('로그인이 필요합니다.');
                    navigate('/login');
                    return;
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadUserInfo();
    }, [navigate]);

    // 블러 처리된 데이터 업데이트
    useEffect(() => {
        setBlurredData({
            email: blurEmail(userInfo.email),
            password: blurPassword("●●●●●●●●●●"), // 비밀번호는 서버에서 받지 않으므로 블러 처리
            phone: formatPhoneNumber(userInfo.phone) // 전체 전화번호 표시
        });
    }, [userInfo]);

    // 비밀번호 변경 처리
    const handlePasswordChange = async () => {
        if (!oldPassword || !newPassword) {
            setPasswordError(t('mypage.info.validation.allFieldsRequired'));
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError(t('mypage.info.validation.passwordMinLength'));
            return;
        }

        try {
            setIsChangingPassword(true);
            setPasswordError("");

            const request: PasswordChangeRequest = {
                currentPassword: oldPassword,
                newPassword
            };

            const success = await eventApi.changePassword(request);

            if (success) {
                setShowPasswordChange(false);
                setOldPassword("");
                setNewPassword("");
                alert(t('mypage.info.validation.passwordChangeSuccess'));
            } else {
                setPasswordError(t('mypage.info.validation.incorrectOldPassword'));
            }
        } catch (error) {
            console.error("비밀번호 변경 실패:", error);
            if (error instanceof Error) {
                setPasswordError(error.message);
            } else {
                setPasswordError("비밀번호 변경 중 오류가 발생했습니다.");
            }
        } finally {
            setIsChangingPassword(false);
        }
    };

    // 개인정보 수정 성공 후 새로고침
    const handleEditSuccess = async () => {
        try {
            setIsLoading(true);
            const userData = await eventApi.getUserInfo();
            setUserInfo(userData);
        } catch (error) {
            console.error("사용자 정보 새로고침 실패:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] min-h-screen relative">
                    <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />
                    <TopNav className="!absolute !left-0 !top-0" />
                    <div className="absolute top-[400px] left-1/2 transform -translate-x-1/2">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-4 text-gray-600">정보를 불러오는 중...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    {t('mypage.info.title')}
                </div>

                <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />
                <TopNav />
                <div className={`absolute w-[949px] left-64 ${showPasswordChange ? 'h-[500px]' : 'h-[213px]'} top-[195px] pb-20`}>
                    <div className="top-0 left-0 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                        내 계정
                    </div>

                    <div className="top-11 left-0 [font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080] text-[15px] absolute tracking-[0] leading-[54px] whitespace-nowrap">
                        이메일 주소
                    </div>

                    <div className="absolute top-[71px] left-0 [font-family:'desktop-Regular',Helvetica] font-normal text-black text-base tracking-[0] leading-[54px] whitespace-nowrap">
                        {blurredData.email}
                    </div>

                    <div className="w-[947px] h-[79px] top-[50px] border-b [border-bottom-style:solid] border-[#0000001a] absolute left-0" />

                    {showPasswordChange ? (
                        // 비밀번호 변경 폼
                        <>
                            <div className="absolute top-32 left-0 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] absolute tracking-[0] leading-[54px] whitespace-nowrap">
                                비밀번호 변경
                            </div>

                            <div className="absolute top-[161px] left-0 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] absolute tracking-[0] leading-[54px] whitespace-nowrap">
                                이전 비밀번호
                            </div>

                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="영문, 숫자, 특수문자 조합 8-20자"
                                className="absolute top-[191px] left-0 w-[947px] h-[54px] [font-family:'Roboto-Regular',Helvetica] font-normal text-black placeholder:text-gray-400 text-[15px] tracking-[0] leading-[54px] bg-transparent border-none outline-none z-10"
                            />

                            <div className="w-[947px] h-[140px] top-[110px] border-b [border-bottom-style:solid] border-[#0000001a] absolute left-0" />

                            <div className="absolute top-[255px] left-0 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[54px] tracking-[0] whitespace-nowrap">
                                새 비밀번호
                            </div>

                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="영문, 숫자, 특수문자 조합 8-20자"
                                className="absolute top-[285px] left-0 w-[947px] h-[54px] [font-family:'Roboto-Regular',Helvetica] font-normal text-black placeholder:text-gray-400 text-[15px] tracking-[0] leading-[54px] bg-transparent border-none outline-none z-10"
                            />

                            <div className="w-[947px] h-[90px] top-[254px] border-b [border-bottom-style:solid] border-[#0000001a] absolute left-0 flex justify-center" />

                            {passwordError && (
                                <div className="absolute top-[340px] left-0 text-red-500 text-sm">
                                    {passwordError}
                                </div>
                            )}

                            <div className="absolute top-[370px] left-0 right-0 flex justify-center space-x-4">
                                <button
                                    onClick={() => {
                                        setShowPasswordChange(false);
                                        setOldPassword("");
                                        setNewPassword("");
                                        setPasswordError("");
                                    }}
                                    className="px-6 py-2 border border-gray-300 rounded-[10px] text-gray-600 bg-white hover:bg-gray-50 transition-colors text-sm"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handlePasswordChange}
                                    disabled={isChangingPassword}
                                    className={`px-6 py-2 rounded-[10px] transition-colors text-sm ${oldPassword && newPassword.length >= 8 && !isChangingPassword
                                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                                        : 'bg-gray-400 text-white cursor-not-allowed'
                                        }`}
                                >
                                    {isChangingPassword ? "변경 중..." : "저장"}
                                </button>
                            </div>
                        </>
                    ) : (
                        // 기본 비밀번호 표시
                        <>
                            <div className="absolute top-32 left-0 [font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080] text-[15px] leading-[54px] tracking-[0] whitespace-nowrap">
                                비밀번호
                            </div>

                            <div className="absolute top-[155px] left-0 [font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-[54px] tracking-[0] whitespace-nowrap">
                                {blurredData.password}
                            </div>

                            <div className="w-[947px] h-[79px] top-[134px] border-b [border-bottom-style:solid] border-[#0000001a] absolute left-0" />

                            <div className="absolute w-[58px] h-[54px] top-[156px] left-[891px]">
                                <div className="relative w-14 h-[54px] cursor-pointer" onClick={() => setShowPasswordChange(true)}>
                                    <div className="w-14 h-9 top-2 rounded-[10px] border border-solid border-[#00000033] absolute left-0" />

                                    <div className="top-0 left-3.5 [font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080] text-[15px] absolute tracking-[0] leading-[54px] whitespace-nowrap">
                                        변경
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* 개인 정보 섹션 - 비밀번호 변경 폼이 표시되면 아래로 이동 */}
                <div className={`absolute w-[949px] h-[335px] left-64 ${showPasswordChange ? 'top-[600px]' : 'top-[455px]'}`}>
                    <div className="top-0 left-0 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                        개인 정보
                    </div>

                    <div className="top-11 left-0 [font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080] text-[15px] absolute tracking-[0] leading-[54px] whitespace-nowrap">
                        이름
                    </div>

                    <div className="absolute top-[71px] left-0 [font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-[54px] tracking-[0] whitespace-nowrap">
                        {userInfo.name}
                    </div>

                    <div className="w-[947px] h-[79px] top-[50px] border-b [border-bottom-style:solid] border-[#0000001a] absolute left-0" />

                    <div className="absolute top-32 left-0 [font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080] text-[15px] leading-[54px] tracking-[0] whitespace-nowrap">
                        닉네임
                    </div>

                    <div className="absolute top-[155px] left-0 [font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-[54px] tracking-[0] whitespace-nowrap">
                        {userInfo.nickname}
                    </div>

                    <div className="w-[947px] h-[79px] top-[134px] border-b [border-bottom-style:solid] border-[#0000001a] absolute left-0" />

                    <div className="absolute top-[209px] left-0 [font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080] text-[15px] leading-[54px] tracking-[0] whitespace-nowrap">
                        휴대폰 번호
                    </div>

                    <p className="absolute top-[237px] left-0 [font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-[54px] tracking-[0] whitespace-nowrap">
                        {blurredData.phone}
                    </p>

                    <div className="w-[947px] h-[79px] top-[216px] border-b [border-bottom-style:solid] border-[#0000001a] absolute left-0" />

                    {/* 개인정보 수정 버튼 - 휴대폰 번호 아래 오른쪽 정렬 */}
                    <div className="absolute top-[305px] right-0">
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="px-4 py-2 border border-gray-300 rounded-[10px] text-gray-600 bg-white hover:bg-gray-50 transition-colors text-sm"
                            style={{ outline: 'none' }}
                        >
                            수정
                        </button>
                    </div>
                </div>

                <div className={`absolute left-64 ${showPasswordChange ? 'top-[1179px]' : 'top-[879px]'}`}>
                    <div
                        className="[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080] text-[15px] leading-[54px] tracking-[0] whitespace-nowrap cursor-pointer hover:text-black underline"
                        onClick={() => navigate('/mypage/withdrawal')}
                    >
                        회원 탈퇴
                    </div>
                </div>



                {/* 개인정보 수정 모달 */}
                <EditProfileModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    currentPhone={userInfo.phone}
                    currentNickname={userInfo.nickname}
                    onSuccess={handleEditSuccess}
                />
            </div>
        </div>
    );
}; 