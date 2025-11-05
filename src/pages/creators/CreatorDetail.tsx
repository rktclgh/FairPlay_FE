import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaInstagram, FaTwitter, FaGlobe, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { TopNav } from '../../components/TopNav';
import { Creator } from '../../components/CreatorCard';
import { getCreatorById } from '../../api/creatorApi';

export const CreatorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCreator = async () => {
      if (!id) {
        setError('제작자 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        const data = await getCreatorById(Number(id));
        setCreator(data);
      } catch (error) {
        console.error('제작자 정보 조회 실패:', error);
        setError('제작자 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchCreator();
  }, [id]);

  const handleBack = () => {
    navigate('/creators');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <TopNav />
        <main className="flex-1 flex justify-center items-center mt-[80px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </main>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <TopNav />
        <main className="flex-1 flex flex-col justify-center items-center mt-[80px] px-4">
          <p className="text-xl text-red-500 mb-4">{error || '제작자 정보를 찾을 수 없습니다.'}</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            목록으로 돌아가기
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 상단 네비게이션 */}
      <TopNav />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 container mx-auto px-4 py-8 mt-[80px]">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          목록으로 돌아가기
        </button>

        {/* 상세 정보 카드 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* 헤더 배경 */}
          <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600"></div>

          {/* 프로필 섹션 */}
          <div className="px-8 pb-8">
            {/* 프로필 이미지 (헤더와 겹치게) */}
            <div className="flex justify-center -mt-20 mb-6">
              {creator.profileImage ? (
                <img
                  src={creator.profileImage}
                  alt={creator.name}
                  className="w-40 h-40 rounded-full object-cover border-8 border-white shadow-xl"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-gray-300 flex items-center justify-center border-8 border-white shadow-xl">
                  <span className="text-6xl text-gray-600 font-bold">
                    {creator.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* 기본 정보 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {creator.name}
              </h1>
              <p className="text-lg font-medium text-blue-600 bg-blue-50 inline-block px-4 py-2 rounded-full mb-4">
                {creator.role}
              </p>
              <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">
                {creator.bio}
              </p>
            </div>

            {/* 연락처 정보 */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">연락처</h2>
              <div className="flex items-center justify-center space-x-2 mb-6">
                <FaEnvelope className="text-gray-500" />
                <a
                  href={`mailto:${creator.email}`}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {creator.email}
                </a>
              </div>

              {/* 소셜 링크 */}
              {(creator.github || creator.linkedin || creator.instagram || creator.twitter || creator.website) && (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">소셜 링크</h2>
                  <div className="flex items-center justify-center space-x-6">
                    {creator.github && (
                      <a
                        href={creator.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center text-gray-600 hover:text-black transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors mb-2">
                          <FaGithub className="w-6 h-6" />
                        </div>
                        <span className="text-xs">GitHub</span>
                      </a>
                    )}
                    {creator.linkedin && (
                      <a
                        href={creator.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center text-gray-600 hover:text-blue-700 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors mb-2">
                          <FaLinkedin className="w-6 h-6" />
                        </div>
                        <span className="text-xs">LinkedIn</span>
                      </a>
                    )}
                    {creator.instagram && (
                      <a
                        href={creator.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center text-gray-600 hover:text-pink-600 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-pink-50 transition-colors mb-2">
                          <FaInstagram className="w-6 h-6" />
                        </div>
                        <span className="text-xs">Instagram</span>
                      </a>
                    )}
                    {creator.twitter && (
                      <a
                        href={creator.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center text-gray-600 hover:text-blue-400 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors mb-2">
                          <FaTwitter className="w-6 h-6" />
                        </div>
                        <span className="text-xs">Twitter</span>
                      </a>
                    )}
                    {creator.website && (
                      <a
                        href={creator.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-green-50 transition-colors mb-2">
                          <FaGlobe className="w-6 h-6" />
                        </div>
                        <span className="text-xs">Website</span>
                      </a>
                    )}
                  </div>
                </>
              )}

              {/* 담당 업무 섹션 */}
              {creator.responsibilities && creator.responsibilities.length > 0 && (
                <div className="border-t border-gray-200 pt-8 mt-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">담당 업무</h2>
                  <div className="max-w-2xl mx-auto">
                    <ul className="space-y-3">
                      {creator.responsibilities.map((responsibility, index) => (
                        <li key={index} className="flex items-start">
                          <svg
                            className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-gray-700">{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatorDetail;
