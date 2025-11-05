import React, { useState, useEffect } from 'react';
import { TopNav } from '../../components/TopNav';
import CreatorCard, { Creator } from '../../components/CreatorCard';
import { getActiveCreators } from '../../api/creatorApi';

export const CreatorList: React.FC = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const data = await getActiveCreators();
        setCreators(data);
      } catch (error) {
        console.error('제작자 목록 조회 실패:', error);
        setError('제작자 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchCreators();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 상단 네비게이션 */}
      <TopNav />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 container mx-auto px-4 py-8 mt-[80px]">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            제작자 소개
          </h1>
          <p className="text-gray-600">
            FairPlay를 만든 팀원들을 소개합니다
          </p>
        </div>

        {/* 제작자 카드 그리드 */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && !error && creators.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">등록된 제작자가 없습니다.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreatorList;
