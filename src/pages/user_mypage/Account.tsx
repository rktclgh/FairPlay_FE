import React, { useState, useRef, useEffect } from "react";
import { AttendeeSideNav } from "./AttendeeSideNav";
import { TopNav } from "../../components/TopNav";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

export const MyPageAccount = () => {
    const [selectedBank, setSelectedBank] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolder, setAccountHolder] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const banks = [
        "KB국민은행",
        "신한은행",
        "우리은행",
        "하나은행",
        "NH농협은행",
        "기업은행",
        "SC제일은행",
        "케이뱅크",
        "카카오뱅크",
        "토스뱅크",
        "새마을금고",
        "신협",
        "수협은행",
        "부산은행",
        "대구은행",
        "광주은행",
        "제주은행",
        "전북은행",
        "경남은행"
    ];

    // 페이지 로드 시 localStorage에서 데이터 불러오기
    useEffect(() => {
        const savedBank = localStorage.getItem('refundAccount_bank');
        const savedAccountNumber = localStorage.getItem('refundAccount_accountNumber');
        const savedAccountHolder = localStorage.getItem('refundAccount_accountHolder');

        if (savedBank) setSelectedBank(savedBank);
        if (savedAccountNumber) setAccountNumber(savedAccountNumber);
        if (savedAccountHolder) setAccountHolder(savedAccountHolder);
    }, []);

    const handleSave = () => {
        // localStorage에 데이터 저장
        localStorage.setItem('refundAccount_bank', selectedBank);
        localStorage.setItem('refundAccount_accountNumber', accountNumber);
        localStorage.setItem('refundAccount_accountHolder', accountHolder);

        console.log("계좌 정보 저장:", {
            bank: selectedBank,
            accountNumber,
            accountHolder
        });
        alert("계좌 정보가 저장되었습니다.");
    };

    const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // 숫자만 허용
        const numericValue = value.replace(/[^0-9]/g, '');
        setAccountNumber(numericValue);
    };

    const handleDropdownClick = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleBankSelect = (bank: string) => {
        setSelectedBank(bank);
        setIsDropdownOpen(false);
    };

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-full md:w-[1256px] min-h-screen relative">
                {/* 제목 - 웹화면에서 원래 위치로 유지, 모바일에서 맨 왼쪽으로 이동 */}
                <div className="md:absolute md:top-[137px] md:left-64 left-0 right-4 top-24 relative md:static">
                    <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-xl md:text-2xl tracking-[0] leading-[54px] whitespace-nowrap">
                        환불 계좌 정보
                    </div>
                </div>

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

                {/* Main form - 웹화면에서 원래 위치로 유지, 모바일에서 맨 왼쪽으로 이동 */}
                <div className="md:absolute md:top-[239px] md:left-64 md:w-[509px] left-0 right-4 top-32 relative w-full md:static">
                    {/* Bank selection */}
                    <div className="mb-6">
                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-2">
                            은행명
                        </label>
                        <div className="relative" ref={dropdownRef}>
                            <div
                                className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 pr-12 font-normal text-base bg-transparent outline-none text-left cursor-pointer flex items-center ${selectedBank ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                onClick={handleDropdownClick}
                            >
                                {selectedBank || "선택하세요"}
                            </div>
                            <div
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center cursor-pointer"
                                onClick={handleDropdownClick}
                            >
                                <div className={`w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} style={{ borderTopColor: 'black' }}></div>
                            </div>

                            {/* Dropdown menu */}
                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                                    {banks.map((bank, index) => (
                                        <div
                                            key={index}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-left"
                                            onClick={() => handleBankSelect(bank)}
                                        >
                                            {bank}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Account number */}
                    <div className="mb-6">
                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-2">
                            계좌번호
                        </label>
                        <input
                            type="text"
                            placeholder="- 없이 입력하세요"
                            value={accountNumber}
                            onChange={handleAccountNumberChange}
                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${accountNumber ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                        />
                    </div>

                    {/* Account holder */}
                    <div className="mb-8">
                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-2">
                            예금주
                        </label>
                        <input
                            type="text"
                            placeholder="예금주명을 정확히 입력하세요"
                            value={accountHolder}
                            onChange={(e) => setAccountHolder(e.target.value)}
                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${accountHolder ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                        />
                    </div>

                    {/* Save button */}
                    <div className="flex justify-center">
                        <button
                            onClick={handleSave}
                            disabled={!selectedBank || !accountNumber || !accountHolder}
                            className={`px-6 py-3 rounded-[10px] transition-colors text-sm font-medium ${selectedBank && accountNumber && accountHolder
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-400 text-white cursor-not-allowed'
                                }`}
                        >
                            저장하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}; 