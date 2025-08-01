import React, { useState, useEffect } from "react";
import { AttendeeSideNav } from "./AttendeeSideNav";
import { TopNav } from "../../components/TopNav";
import { useNavigate } from "react-router-dom";
import { eventApi } from "../../services/api";
import type { UserInfo, PasswordChangeRequest } from "../../services/api";

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

const blurPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return "";
    const cleaned = phoneNumber.replace(/[^0-9]/g, '');
    if (cleaned.length !== 11) return phoneNumber;

    const first = cleaned.substring(0, 3);
    const middle = cleaned.substring(3, 7);
    const last = cleaned.substring(7);

    const blurredMiddle = middle.substring(0, 1) + '•••';
    const blurredLast = '•' + last.substring(1);

    return `${first} - ${blurredMiddle} - ${blurredLast}`;
};

export const MyPageInfo = () => {
    const navigate = useNavigate();

    // 사용자 정보 상태
    const [userInfo, setUserInfo] = useState<UserInfo>({
        email: "",
        name: "",
        phoneNumber: ""
    });

    // 로딩 상태
    const [isLoading, setIsLoading] = useState(true);

    // 블러 처리된 데이터들
    const [blurredData, setBlurredData] = useState({
        email: "",
        password: "",
        phoneNumber: ""
    });

    // 비밀번호 변경 폼 표시 상태
    const [showPasswordChange, setShowPasswordChange] = useState(false);

    // 비밀번호 입력 상태
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // 비밀번호 변경 상태
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    // 사용자 정보 로드
    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                setIsLoading(true);
                const userData = await eventApi.getUserInfo();
                setUserInfo(userData);
            } catch (error) {
                console.error("사용자 정보 로드 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserInfo();
    }, []);

    // 블러 처리된 데이터 업데이트
    useEffect(() => {
        setBlurredData({
            email: blurEmail(userInfo.email),
            password: blurPassword("●●●●●●●●●●"), // 비밀번호는 서버에서 받지 않으므로 블러 처리
            phoneNumber: blurPhoneNumber(userInfo.phoneNumber)
        });
    }, [userInfo]);

    // 비밀번호 변경 처리
    const handlePasswordChange = async () => {
        if (!oldPassword || !newPassword) {
            setPasswordError("모든 필드를 입력해주세요.");
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError("새 비밀번호는 8자 이상이어야 합니다.");
            return;
        }

        try {
            setIsChangingPassword(true);
            setPasswordError("");

            const request: PasswordChangeRequest = {
                oldPassword,
                newPassword
            };

            const success = await eventApi.changePassword(request);

            if (success) {
                setShowPasswordChange(false);
                setOldPassword("");
                setNewPassword("");
                alert("비밀번호가 성공적으로 변경되었습니다.");
            } else {
                setPasswordError("이전 비밀번호가 올바르지 않습니다.");
            }
        } catch (error) {
            console.error("비밀번호 변경 실패:", error);
            setPasswordError("비밀번호 변경 중 오류가 발생했습니다.");
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white flex flex-row justify-center w-full">
                <div className="bg-white w-[1256px] h-[1207px] relative">
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
            <div className="bg-white w-[1256px] h-[1207px] relative">
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    내 정보 조회
                </div>

                <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />
                <TopNav
                    className="!absolute !left-0 !top-0"
                />
                <div className={`absolute w-[949px] left-64 ${showPasswordChange ? 'h-[500px]' : 'h-[213px]'} top-[195px]`}>
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
                <div className={`absolute w-[949px] h-[213px] left-64 ${showPasswordChange ? 'top-[755px]' : 'top-[455px]'}`}>
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
                        휴대폰 번호
                    </div>

                    <p className="absolute top-[155px] left-0 [font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base leading-[54px] tracking-[0] whitespace-nowrap">
                        {blurredData.phoneNumber}
                    </p>

                    <div className="w-[947px] h-[79px] top-[134px] border-b [border-bottom-style:solid] border-[#0000001a] absolute left-0" />
                </div>

                <div className={`absolute left-64 ${showPasswordChange ? 'top-[1057px]' : 'top-[757px]'}`}>
                    <div
                        className="[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000080] text-[15px] leading-[54px] tracking-[0] whitespace-nowrap cursor-pointer hover:text-black underline"
                        onClick={() => navigate('/mypage/withdrawal')}
                    >
                        회원 탈퇴
                    </div>
                </div>

                <div className="absolute w-[1256px] h-[205px] top-[1002px] left-0 bg-white border-t [border-top-style:solid] border-[#0000001f]">
                    <p className="absolute top-[62px] left-[515px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-base text-center leading-6 tracking-[0] whitespace-nowrap">
                        간편하고 안전한 행사 관리 솔루션
                    </p>

                    <div className="absolute top-[118px] left-[450px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-sm text-center leading-[21px] tracking-[0] whitespace-nowrap">
                        이용약관
                    </div>

                    <div className="absolute top-[118px] left-[534px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-sm text-center leading-[21px] tracking-[0] whitespace-nowrap">
                        개인정보처리방침
                    </div>

                    <div className="absolute top-[118px] left-[669px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-sm text-center leading-[21px] tracking-[0] whitespace-nowrap">
                        고객센터
                    </div>

                    <div className="absolute top-[118px] left-[752px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-sm text-center leading-[21px] tracking-[0] whitespace-nowrap">
                        회사소개
                    </div>
                </div>
            </div>
        </div>
    );
}; 