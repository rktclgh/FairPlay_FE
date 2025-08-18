import React, { useState } from "react";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";

export const IntegrationSettings: React.FC = () => {
    // 도메인
    const [baseDomain, setBaseDomain] = useState<string>("https://fair-play.ink/");
    const [customSubdomain, setCustomSubdomain] = useState<string>("admin.fair-play.ink");

    // 다국어
    const [langKo, setLangKo] = useState<boolean>(true);
    const [langEn, setLangEn] = useState<boolean>(false);
    const [langJa, setLangJa] = useState<boolean>(false);
    const [langZh, setLangZh] = useState<boolean>(false);

    // 외부 연동
    const [gaId, setGaId] = useState<string>("G-XXXXXXXXXX");
    const [pixelId, setPixelId] = useState<string>("");
    const [openaiKey, setOpenaiKey] = useState<string>("");

    // 알림
    const [notifySystemError, setNotifySystemError] = useState<boolean>(false);
    const [notifyNewEvent, setNotifyNewEvent] = useState<boolean>(false);
    const [notifyPayment, setNotifyPayment] = useState<boolean>(false);
    const [notifyDailyReport, setNotifyDailyReport] = useState<boolean>(false);
    const [notifyEmail, setNotifyEmail] = useState<string>("admin@fair-play.ink");

    // 보안
    const [sessionTimeoutMin, setSessionTimeoutMin] = useState<number>(60);
    const [loginAttemptLimit, setLoginAttemptLimit] = useState<number>(5);
    const [enforce2fa, setEnforce2fa] = useState<boolean>(true);
    const [ipWhitelist, setIpWhitelist] = useState<boolean>(false);
    const [saveLoginLogs, setSaveLoginLogs] = useState<boolean>(true);

    // 백업
    const [backupCycle, setBackupCycle] = useState<string>("매일");

    const handleSaveAll = () => {
        // TODO: 실제 저장 API 연동
        // 현재는 콘솔 출력용
        // eslint-disable-next-line no-console
        console.log({ baseDomain, customSubdomain, langKo, langEn, langJa, langZh, gaId, pixelId, openaiKey, notifySystemError, notifyNewEvent, notifyPayment, notifyDailyReport, notifyEmail, sessionTimeoutMin, loginAttemptLimit, enforce2fa, ipWhitelist, saveLoginLogs, backupCycle });
        alert("설정이 임시로 저장되었습니다. (데모)");
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    연동 설정
                </div>

                {/* 사이드바 */}
                <AdminSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-24 space-y-6">
                    {/* 도메인 설정 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">도메인 설정</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">기본 도메인</label>
                                <input
                                    type="text"
                                    value={baseDomain}
                                    onChange={(e) => setBaseDomain(e.target.value)}
                                    placeholder="https://fair-play.ink/"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">커스텀 서브도메인</label>
                                <input
                                    type="text"
                                    value={customSubdomain}
                                    onChange={(e) => setCustomSubdomain(e.target.value)}
                                    placeholder="admin.fair-play.ink"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <p className="text-xs text-gray-500">커스텀 도메인을 설정하면 사용자 브랜딩이 가능합니다.</p>
                        </div>
                    </div>

                    {/* 다국어 설정 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">다국어 설정</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                                <input type="checkbox" checked={langKo} onChange={(e) => setLangKo(e.target.checked)} /> 한국어
                            </label>
                            <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                                <input type="checkbox" checked={langEn} onChange={(e) => setLangEn(e.target.checked)} /> 영어
                            </label>
                            <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                                <input type="checkbox" checked={langJa} onChange={(e) => setLangJa(e.target.checked)} /> 일본어
                            </label>
                            <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                                <input type="checkbox" checked={langZh} onChange={(e) => setLangZh(e.target.checked)} /> 중국어
                            </label>
                        </div>
                        <p className="mt-3 text-xs text-gray-500">다국어 설정 시, 각 언어에 맞게 사용자 화면이 자동 전환됩니다.</p>
                    </div>

                    {/* 외부 연동 API 설정 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">외부 연동 API 설정</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics 추적 ID</label>
                                <input
                                    type="text"
                                    value={gaId}
                                    onChange={(e) => setGaId(e.target.value)}
                                    placeholder="G-XXXXXXXXXX"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Pixel ID</label>
                                <input
                                    type="text"
                                    value={pixelId}
                                    onChange={(e) => setPixelId(e.target.value)}
                                    placeholder="픽셀 ID를 입력하세요"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">OpenAI API Key</label>
                                <input
                                    type="password"
                                    value={openaiKey}
                                    onChange={(e) => setOpenaiKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <p className="text-xs text-gray-500">각 API Key를 설정하면 실시간 통계, 마케팅 연동, AI 기능을 활성화할 수 있습니다.</p>
                        </div>
                    </div>

                    {/* 알림 설정 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">알림 설정</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                                <input type="checkbox" checked={notifySystemError} onChange={(e) => setNotifySystemError(e.target.checked)} /> 시스템 오류 알림
                            </label>
                            <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                                <input type="checkbox" checked={notifyNewEvent} onChange={(e) => setNotifyNewEvent(e.target.checked)} /> 새로운 행사 등록 알림
                            </label>
                            <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                                <input type="checkbox" checked={notifyPayment} onChange={(e) => setNotifyPayment(e.target.checked)} /> 결제 완료 알림
                            </label>
                            <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                                <input type="checkbox" checked={notifyDailyReport} onChange={(e) => setNotifyDailyReport(e.target.checked)} /> 일일 통계 리포트
                            </label>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">알림 수신 이메일</label>
                            <input
                                type="email"
                                value={notifyEmail}
                                onChange={(e) => setNotifyEmail(e.target.value)}
                                placeholder="admin@fairplay.events"
                                className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* 보안 설정 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">보안 설정</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">세션 만료 시간 (분)</label>
                                <input
                                    type="number"
                                    min={5}
                                    value={sessionTimeoutMin}
                                    onChange={(e) => setSessionTimeoutMin(parseInt(e.target.value || '0', 10))}
                                    className="w-40 px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">로그인 시도 제한</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={loginAttemptLimit}
                                    onChange={(e) => setLoginAttemptLimit(parseInt(e.target.value || '0', 10))}
                                    className="w-32 px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 mt-4">
                            <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                                <input type="checkbox" checked={enforce2fa} onChange={(e) => setEnforce2fa(e.target.checked)} /> 2단계 인증 강제
                            </label>
                            <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                                <input type="checkbox" checked={ipWhitelist} onChange={(e) => setIpWhitelist(e.target.checked)} /> IP 화이트리스트 사용
                            </label>
                            <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                                <input type="checkbox" checked={saveLoginLogs} onChange={(e) => setSaveLoginLogs(e.target.checked)} /> 로그인 기록 저장
                            </label>
                        </div>
                    </div>

                    {/* 백업 설정 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">백업 설정</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">자동 백업 주기</label>
                                <select
                                    value={backupCycle}
                                    onChange={(e) => setBackupCycle(e.target.value)}
                                    className="w-48 px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option>매일</option>
                                    <option>매주</option>
                                    <option>매월</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 저장 버튼 */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleSaveAll}
                            className="px-5 py-2 bg-blue-600 text-white rounded-[10px] hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            저장
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntegrationSettings;
