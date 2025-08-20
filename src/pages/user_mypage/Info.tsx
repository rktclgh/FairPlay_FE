import React, { useState, useEffect } from "react";
import { AttendeeSideNav } from "./AttendeeSideNav";
import { TopNav } from "../../components/TopNav";
import { useNavigate } from "react-router-dom";
import { eventApi } from "../../services/api";
import type { UserInfo, PasswordChangeRequest } from "../../services/api";
import { EditProfileModal } from "../../components/EditProfileModal";
import { useTranslation } from "react-i18next";
import NewLoader from "../../components/NewLoader";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

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

    // 모바일 사이드바 상태
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // 사용자 정보 로드
    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                setIsLoading(true);
                const userData = await eventApi.getUserInfo();
                setUserInfo(userData);
            } catch (error) {
                console.error(t('mypage.info.loadUserFailed'), error);
                // 로그인이 필요한 경우 로그인 페이지로 리다이렉트
                if (error instanceof Error && error.message === '로그인이 필요합니다.') {
                    alert(t('mypage.info.loginRequired'));
                    navigate('/login');
                    return;
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadUserInfo();
    }, [navigate, t]);

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
            console.error(t('mypage.info.validation.passwordChangeError'), error);
            if (error instanceof Error) {
                setPasswordError(error.message);
            } else {
                setPasswordError(t('mypage.info.validation.passwordChangeError'));
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
            console.error(t('mypage.info.refreshFailed'), error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-full md:w-[1256px] min-h-screen relative">
                    <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />
                    <TopNav className="!absolute !left-0 !top-0" />
                    <div className="absolute top-[400px] left-1/2 transform -translate-x-1/2">
                        <div className="text-center">
                            <NewLoader />
                            <p className="mt-4 text-gray-600">{t('mypage.info.loading')}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-full md:w-[1256px] min-h-screen relative">
                {/* 모바일 햄버거 버튼 - 상단바 좌측 아래에 위치 */}
                <button
                    onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    className="md:hidden fixed top-20 left-4 z-50 p-3 bg-transparent"
                >
                    {isMobileSidebarOpen ? (
                        <HiOutlineX className="w-6 h-6 text-gray-600" />
                    ) : (
                        <HiOutlineMenu className="w-6 h-6 text-gray-600" />
                    )}
                </button>

                {/* 모바일 사이드바 오버레이 */}
                {isMobileSidebarOpen && (
                    <div
                        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                )}

                {/* 모바일 사이드바 */}
                <div className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}>
                    <div className="p-4">
                        <button
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="absolute top-4 right-4 p-2"
                        >
                            <HiOutlineX className="w-6 h-6 text-gray-600" />
                        </button>
                        <AttendeeSideNav className="!relative !top-0 !left-0" />
                    </div>
                </div>

                {/* 데스크톱 사이드바 - 웹화면에서 절대적으로 고정 */}
                <div className="hidden md:block">
                    <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />
                </div>

                <TopNav />

                {/* 제목 - 웹화면에서 원래 위치로 유지 */}
                <div className="md:absolute md:top-[137px] md:left-64 left-4 right-4 top-16 relative md:static">
                    <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-xl md:text-2xl tracking-[0] leading-[54px] whitespace-nowrap">
                        {t('mypage.info.title')}
                    </div>
                </div>

                {/* 콘텐츠 - 웹화면에서 원래 위치로 유지 */}
                <div className={`md:absolute md:w-[949px] md:left-64 left-4 right-4 top-16 relative md:static ${showPasswordChange ? 'md:h-[600px]' : 'md:h-[213px]'} md:top-[195px] md:pb-20`}>
                    <div className="md:absolute md:top-0 md:left-0 left-0 top-0 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-xl tracking-[0] leading-[54px] whitespace-nowrap">
                        {t('mypage.info.myAccount')}
                    </div>

                    <div className="md:absolute md:top-11 md:left-0 left-0 top-4 [font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080] text-[15px] tracking-[0] md:leading-[54px] leading-6 whitespace-nowrap">
                        {t('mypage.info.emailAddress')}
                    </div>

                    <div className="md:absolute md:top-[71px] md:left-0 left-0 top-8 [font-family:'desktop-Regular',Helvetica] font-normal text-black text-base tracking-[0] md:leading-[54px] leading-6 whitespace-nowrap">
                        {blurredData.email}
                    </div>

                    <div className="w-full md:w-[947px] md:h-[79px] h-4 top-[50px] md:top-[50px] top-0 border-b [border-bottom-style:solid] border-[#0000001a] md:absolute md:left-0 left-0" />

                    {showPasswordChange ? (
                        // 비밀번호 변경 폼
                        <>
                            <div className="md:absolute md:top-32 md:left-0 left-0 -top-4 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] tracking-[0] leading-[54px] whitespace-nowrap">
                                {t('mypage.info.changePassword')}
                            </div>

                            <div className="md:absolute md:top-[161px] md:left-0 left-0 -top-2 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] tracking-[0] leading-[54px] whitespace-nowrap">
                                {t('mypage.info.oldPassword')}
                            </div>

                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder={t('mypage.info.passwordRule')}
                                className="md:absolute md:top-[191px] md:left-0 left-0 top-0 w-full md:w-[947px] h-[54px] [font-family:'Roboto-Regular',Helvetica] font-normal text-black placeholder:text-gray-400 text-[15px] tracking-[0] leading-[54px] bg-transparent border-none outline-none z-10"
                            />

                            <div className="w-full md:w-[947px] h-4 md:h-[140px] top-[110px] md:top-[110px] -top-4 border-b [border-bottom-style:solid] border-[#0000001a] md:absolute md:left-0 left-0" />

                            <div className="md:absolute md:top-[255px] md:left-0 left-0 top-2 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[54px] tracking-[0] whitespace-nowrap">
                                {t('mypage.info.newPassword')}
                            </div>

                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder={t('mypage.info.passwordRule')}
                                className="md:absolute md:top-[285px] md:left-0 left-0 top-4 w-full md:w-[947px] h-[54px] [font-family:'Roboto-Regular',Helvetica] font-normal text-black placeholder:text-gray-400 text-[15px] tracking-[0] leading-[54px] bg-transparent border-none outline-none z-10"
                            />

                            <div className="w-full md:w-[947px] h-4 md:h-[90px] top-[254px] md:top-[254px] -top-2 border-b [border-bottom-style:solid] border-[#0000001a] md:absolute md:top-[254px] md:left-0 left-0 flex justify-center" />

                            {passwordError && (
                                <div className="md:absolute md:top-[400px] md:left-0 left-0 top-8 text-red-500 text-sm">
                                    {passwordError}
                                </div>
                            )}

                            <div className="md:absolute md:top-[370px] md:left-0 md:right-0 left-0 right-0 top-12 flex justify-center space-x-4">
                                <button
                                    onClick={() => {
                                        setShowPasswordChange(false);
                                        setOldPassword("");
                                        setNewPassword("");
                                        setPasswordError("");
                                    }}
                                    className="px-6 py-2 border border-gray-300 rounded-[10px] text-gray-600 bg-white hover:bg-gray-50 transition-colors text-sm"
                                >
                                    {t('mypage.info.cancel')}
                                </button>
                                <button
                                    onClick={handlePasswordChange}
                                    disabled={isChangingPassword}
                                    className={`px-6 py-2 rounded-[10px] transition-colors text-sm ${oldPassword && newPassword.length >= 8 && !isChangingPassword
                                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                                        : 'bg-gray-400 text-white cursor-not-allowed'
                                        }`}
                                >
                                    {isChangingPassword ? t('mypage.info.saving') : t('mypage.info.save')}
                                </button>
                            </div>
                        </>
                    ) : (
                        // 기본 비밀번호 표시
                        <>
                            <div className="md:absolute md:top-32 md:left-0 left-0 top-12 [font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080] text-[15px] md:leading-[54px] leading-6 tracking-[0] whitespace-nowrap">
                                {t('mypage.info.password')}
                            </div>

                            <div className="md:absolute md:top-[155px] md:left-0 left-0 top-20 [font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base md:leading-[54px] leading-6 tracking-[0] whitespace-nowrap">
                                {blurredData.password}
                            </div>

                            <div className="w-full md:w-[947px] md:h-[79px] h-4 top-[134px] md:top-[134px] top-8 border-b [border-bottom-style:solid] border-[#0000001a] md:absolute md:left-0 left-0" />

                            {/* 비밀번호 변경 버튼 - 기본 상태에서만 표시 */}
                            {!showPasswordChange && (
                                <div className="md:absolute md:top-[156px] md:right-0 left-0 top-24 w-full md:w-auto flex justify-end">
                                    <button
                                        onClick={() => setShowPasswordChange(true)}
                                        className="px-4 py-2 border border-gray-300 rounded-[10px] text-gray-600 bg-white hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
                                        style={{ outline: 'none' }}
                                    >
                                        {t('mypage.info.change')}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* 개인 정보 섹션 - 비밀번호 변경 폼이 표시되면 아래로 이동 */}
                <div className={`md:absolute md:w-[949px] md:h-[335px] md:left-64 left-4 right-4 top-16 relative md:static ${showPasswordChange ? 'md:top-[600px]' : 'md:top-[455px]'}`}>
                    <div className="md:absolute md:top-0 md:left-0 left-0 top-0 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-xl tracking-[0] leading-[54px] whitespace-nowrap">
                        {t('mypage.info.personalInfo')}
                    </div>

                    <div className="md:absolute md:top-11 md:left-0 left-0 top-6 [font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080] text-[15px] md:leading-[54px] leading-6 tracking-[0] whitespace-nowrap">
                        {t('mypage.info.name')}
                    </div>

                    <div className="md:absolute md:top-[71px] md:left-0 left-0 top-12 [font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base md:leading-[54px] leading-6 tracking-[0] whitespace-nowrap">
                        {userInfo.name}
                    </div>

                    <div className="w-full md:w-[947px] md:h-[79px] h-4 top-[50px] md:top-[50px] top-4 border-b [border-bottom-style:solid] border-[#0000001a] md:absolute md:left-0 left-0" />

                    <div className="md:absolute md:top-32 md:left-0 left-0 top-16 [font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080] text-[15px] md:leading-[54px] leading-6 tracking-[0] whitespace-nowrap">
                        {t('mypage.info.nickname')}
                    </div>

                    <div className="md:absolute md:top-[155px] md:left-0 left-0 top-20 [font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base md:leading-[54px] leading-6 tracking-[0] whitespace-nowrap">
                        {userInfo.nickname}
                    </div>

                    <div className="w-full md:w-[947px] md:h-[79px] h-4 top-[134px] md:top-[134px] top-8 border-b [border-bottom-style:solid] border-[#0000001a] md:absolute md:left-0 left-0" />

                    <div className="md:absolute md:top-[209px] md:left-0 left-0 top-24 [font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080] text-[15px] md:leading-[54px] leading-6 tracking-[0] whitespace-nowrap">
                        {t('mypage.info.phoneNumber')}
                    </div>

                    <p className="md:absolute md:top-[237px] md:left-0 left-0 top-28 [font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base md:leading-[54px] leading-6 tracking-[0] whitespace-nowrap">
                        {blurredData.phone}
                    </p>

                    <div className="w-full md:w-[947px] md:h-[79px] h-4 top-[216px] md:top-[216px] top-8 border-b [border-bottom-style:solid] border-[#0000001a] md:absolute md:left-0 left-0" />

                    {/* 개인정보 수정 버튼 - 휴대폰 번호 아래 오른쪽 정렬 */}
                    <div className="md:absolute md:top-[305px] md:right-0 left-0 right-0 top-32 flex justify-end">
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="px-4 py-2 border border-gray-300 rounded-[10px] text-gray-600 bg-white hover:bg-gray-50 transition-colors text-sm"
                            style={{ outline: 'none' }}
                        >
                            {t('mypage.info.edit')}
                        </button>
                    </div>
                </div>

                <div className={`md:absolute md:left-64 left-4 right-4 top-16 relative md:static ${showPasswordChange ? 'md:top-[1179px]' : 'md:top-[879px]'}`}>
                    <div
                        className="[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080] text-[15px] leading-[54px] tracking-[0] whitespace-nowrap cursor-pointer hover:text-black underline"
                        onClick={() => navigate('/mypage/withdrawal')}
                    >
                        {t('mypage.info.withdrawal')}
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