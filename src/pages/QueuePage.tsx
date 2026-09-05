import React from 'react';
import { QueueList } from '../components/organisms/QueueList';

export const QueuePage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <QueueList />
    </div>
  );
};
