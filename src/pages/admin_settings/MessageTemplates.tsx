import React, { useEffect, useState } from "react";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";
import api from "../../api/axios";

// Axios 인터셉터로 모든 요청에 JWT 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const MessageTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<string[]>([]); // 템플릿 목록
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null); // 선택된 템플릿
  const [templateHtml, setTemplateHtml] = useState<string>(""); // 편집 HTML

  // 1️⃣ 템플릿 목록 불러오기
  const fetchTemplateList = async () => {
    try {
      const res = await api.get("/api/super-admin/templates");
      setTemplates(res.data);
    } catch (err) {
      console.error(err);
      alert("템플릿 목록 불러오기 실패");
    }
  };

  useEffect(() => {
    fetchTemplateList();
  }, []);

  // 2️⃣ 선택된 템플릿 불러오기
  const selectTemplate = async (name: string) => {
    try {
      setSelectedTemplate(name);
      const res = await api.get(`/api/super-admin/template/${name}`, { responseType: "text" });
      setTemplateHtml(res.data);
    } catch (err) {
      console.error(err);
      alert("템플릿 불러오기 실패");
    }
  };

  // 3️⃣ 저장 API 호출
  const saveTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      await api.post(
      `/api/super-admin/template/save/${selectedTemplate}`,
      templateHtml, // HTML 문자열 그대로
      {
        headers: {
          "Content-Type": "text/plain", // JSON이 아닌 plain text
        },
      }
    );
      alert("템플릿 저장 완료");
    } catch (err) {
      console.error(err);
      alert("템플릿 저장 실패");
    }
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full min-h-screen">
      <div className="bg-white w-[1256px] relative">
        <TopNav />

        {/* 페이지 제목 */}
        <div className="top-[137px] left-64 absolute font-bold text-2xl tracking-[0] leading-[54px]">
          이메일 템플릿
        </div>

        {/* 사이드바 */}
        <AdminSideNav className="!absolute !left-0 !top-[117px]" />

        {/* 메인 콘텐츠 */}
        <div className="absolute left-64 top-[195px] w-[949px] pb-20 flex">
          {/* 좌측: 템플릿 목록 */}
          <div className="w-1/4 border-r pr-4">
            <h2 className="font-bold mb-4">템플릿 목록</h2>
            <ul>
              {templates.map((name) => (
                <li key={name} className="mb-2">
                  <button
                    onClick={() => selectTemplate(name)}
                    className={`w-full text-left px-2 py-1 rounded ${
                      selectedTemplate === name ? "bg-blue-100" : "hover:bg-gray-100"
                    }`}
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 우측: 선택된 템플릿 편집 */}
          <div className="w-3/4 pl-4">
            {selectedTemplate ? (
              <div>
                <h3 className="font-bold mb-2">{selectedTemplate} 수정</h3>
                <textarea
                  value={templateHtml}
                  onChange={(e) => setTemplateHtml(e.target.value)}
                  className="w-full h-[400px] border rounded p-2 mb-4"
                />
                <div className="flex justify-end">
                  <button
                    onClick={saveTemplate}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    저장
                  </button>
                </div>
              </div>
            ) : (
              <p>좌측에서 편집할 템플릿을 선택하세요.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageTemplates;