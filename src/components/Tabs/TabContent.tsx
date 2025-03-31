import React, { Suspense } from 'react';
import { PrizesTab } from './PrizesTab';
import { TasksTab } from '../Tasks/TasksTab';
import { ShopTab } from './ShopTab';
import { HomeContent } from '../HomeContent';
import { RatingTab } from './RatingTab';
import { ContentSkeleton } from '../Skeleton/ContentSkeleton';

interface Prize {
  id: number;
  name: string;
  points: number;
  description: string;
  botUrl: string;
  imageUrl: string;
}

interface TabContentProps {
  activeTab: string;
  prizes: Prize[];
  onPrizeSelect: (prize: Prize) => void;
  onShowArticle: () => void;
  onTabChange: (tab: string) => void;
}

export function TabContent({ activeTab, prizes, onPrizeSelect, onShowArticle, onTabChange }: TabContentProps) {
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Suspense fallback={<ContentSkeleton type="home" />}>
            <HomeContent
              prizes={prizes}
              onPrizeSelect={onPrizeSelect}
              onShare={() => {}}
              onCopy={() => {}}
            />
          </Suspense>
        );
      case 'prizes':
        return (
          <Suspense fallback={<ContentSkeleton type="prizes" />}>
            <PrizesTab prizes={prizes} onPrizeSelect={onPrizeSelect} />
          </Suspense>
        );
      case 'tasks':
        return (
          <Suspense fallback={<ContentSkeleton type="tasks" />}>
            <TasksTab onShowArticle={onShowArticle} />
          </Suspense>
        );
      case 'shop':
        return (
          <Suspense fallback={<ContentSkeleton type="shop" />}>
            <ShopTab prizes={prizes} onPrizeSelect={onPrizeSelect} />
          </Suspense>
        );
      case 'rating':
        return (
          <Suspense fallback={<ContentSkeleton type="rating" />}>
            <RatingTab />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto pb-[72px]">
        {renderContent()}
      </div>
    </div>
  );
}