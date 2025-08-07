import React, { useState } from "react";
import { TopNav } from "../../components/TopNav";
import { useNavigate } from "react-router-dom";

// 간단한 스피너 컴포넌트
const Spinner = () => (
    <svg className="animate-spin mr-2 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
);

// 토스트 알림 컴포넌트
const Toast = ({ message, onClose }) => (
    <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-4 py-2 rounded shadow-md flex items-center animate-fade-in-down">
        {message}
        <button className="ml-4 font-bold" onClick={onClose}>닫기</button>
    </div>
);

export const FindPassword = () => {
    const [email, setEmail] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalState, setModalState] = useState("idle"); // idle | loading | success
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [toast, setToast] = useState("");
    const navigate = useNavigate();

    const isEmailValid = email.trim() !== "" && email.includes("@");

    // API 연동 함수
    const sendTempPassword = async () => {
        const response = await fetch('/api/users/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '임시 비밀번호 발송에 실패했습니다.');
        }
        return response;
    };

    const handleSendTempPassword = async () => {
        setErrorMsg("");
        setLoading(true);
        setShowModal(true);
        setModalState("loading");

        try {
            await sendTempPassword();
            setModalState("success");
            setTimeout(() => {
                setShowModal(false);
                setLoading(false);
                navigate('/login');
            }, 2000);
        } catch (e) {
            setShowModal(false);
            setLoading(false);
            setErrorMsg(e.message);
            setToast(e.message);
            setTimeout(() => setToast(""), 3500); // 3.5초 후 토스트 자동 닫힘
        }
    };

    // 엔터키로도 발송
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && isEmailValid && !loading) {
            handleSendTempPassword();
        }
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-[1128px] relative">
                <TopNav className="!absolute !left-0 !-top-0.5" />

                <div className="absolute top-44 left-[535px] font-bold text-black text-[32px] text-center leading-[48px] whitespace-nowrap">
                    비밀번호 찾기
                </div>

                <p className="absolute top-[232px] left-[479px] font-normal text-gray-500 text-base text-center leading-6 whitespace-nowrap">
                    등록된 이메일로 임시 비밀번호를 받아보세요
                </p>

                <div className="absolute top-[280px] left-[428px] font-normal text-[#2d3748] text-sm leading-[21px] whitespace-nowrap">
                    이메일 주소
                </div>

                <div className="absolute w-[411px] h-[52px] top-[310px] left-[428px] border-b border-gray-300">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="이메일 주소를 입력하세요"
                        className="absolute w-[380px] h-[21px] top-[13px] left-[15px] font-normal text-black placeholder:text-[#00000080] text-base leading-[normal] bg-transparent border-none outline-none"
                        style={{
                            WebkitBoxShadow: '0 0 0 1000px white inset'
                        } as React.CSSProperties}
                        disabled={loading}
                        autoFocus
                    />
                </div>

                {/* 에러 메시지 */}
                <div className="absolute top-[345px] left-[428px] w-[411px] h-6">
                    {errorMsg && (
                        <div className="text-red-600 text-sm font-medium">{errorMsg}</div>
                    )}
                </div>

                <button
                    className={`absolute w-[411px] h-[52px] top-[403px] left-[428px] rounded-[10px] flex items-center justify-center transition-colors focus:outline-none
          ${isEmailValid && !loading
                            ? 'bg-black text-white hover:bg-gray-800 cursor-pointer'
                            : 'bg-[#d9d9d9] text-white cursor-not-allowed'}
          `}
                    disabled={!isEmailValid || loading}
                    onClick={handleSendTempPassword}
                >
                    <div className="font-semibold text-base text-center leading-6 whitespace-nowrap flex items-center justify-center">
                        {loading ? <Spinner /> : null}
                        {loading ? "처리 중..." : "임시 비밀번호 발송"}
                    </div>
                </button>

                {/* 모달 */}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-[1001] bg-black bg-opacity-30">
                        <div className="bg-white w-[411px] rounded-[10px] shadow-lg border border-gray-200">
                            <div className="p-8 text-center">
                                <div className="mb-6">
                                    <img
                                        className="w-16 h-16 mx-auto mb-4"
                                        alt="Success Icon"
                                        src="/images/FPlogo.png"
                                    />
                                    {modalState === "loading" && (
                                        <>
                                            <div className="flex items-center justify-center mb-2">
                                                <Spinner />
                                                <span className="font-bold text-black text-xl ml-2">메일 발송 중...</span>
                                            </div>
                                            <p className="font-normal text-gray-600 text-base leading-6">
                                                잠시만 기다려주세요.
                                            </p>
                                        </>
                                    )}
                                    {modalState === "success" && (
                                        <>
                                            <h3 className="font-bold text-black text-xl mb-2">
                                                임시 비밀번호 발송 완료
                                            </h3>
                                            <p className="font-normal text-gray-600 text-base mb-2">
                                                {email}로 임시 비밀번호가 발송되었습니다.
                                                <br />
                                                <span className="text-sm text-gray-500">스팸/프로모션함도 꼭 확인하세요.</span>
                                            </p>
                                            <div className="font-normal text-gray-500 text-sm leading-[21px]">
                                                로그인 페이지로 이동합니다...
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 토스트 알림 */}
                {toast && <Toast message={toast} onClose={() => setToast("")} />}

                {/* 푸터 등 기타 UI */}
                <div className="absolute w-[1256px] h-[205px] top-[923px] left-0 bg-white border-t border-[#0000001f]">
                    <p className="absolute top-[62px] left-[515px] font-normal text-[#666666] text-base text-center leading-6 whitespace-nowrap">
                        간편하고 안전한 행사 관리 솔루션
                    </p>
                    <div className="absolute top-[118px] left-[450px] font-normal text-[#666666] text-sm text-center leading-[21px] whitespace-nowrap">
                        이용약관
                    </div>
                    <div className="absolute top-[118px] left-[534px] font-normal text-[#666666] text-sm text-center leading-[21px] whitespace-nowrap">
                        개인정보처리방침
                    </div>
                    <div className="absolute top-[118px] left-[669px] font-normal text-[#666666] text-sm text-center leading-[21px] whitespace-nowrap">
                        고객센터
                    </div>
                    <div className="absolute top-[118px] left-[752px] font-normal text-[#666666] text-sm text-center leading-[21px] whitespace-nowrap">
                        회사소개
                    </div>
                </div>
            </div>
        </div>
    );
};
