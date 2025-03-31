import React from 'react';
import { User } from 'lucide-react';

interface UserProfileProps {
  user: {
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  } | null;
}

export function UserProfile({ user }: UserProfileProps) {
  const firstName = user?.first_name.split(' ')[0] || 'участник';

  return (
    <div className="flex items-center space-x-3 max-w-[60%]">
      {user?.photo_url ? (
        <img
          src={user.photo_url}
          alt={firstName}
          className="w-10 h-10 flex-shrink-0 rounded-full object-cover border-2 border-[#865df6]"
        />
      ) : (
        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center border-2 border-[#865df6]">
          <User size={20} className="text-[#865df6]" />
        </div>
      )}
      <div className="min-w-0">
        <h1 className="text-base font-semibold text-gray-900 truncate">
          Привет, {firstName}!
        </h1>
      </div>
    </div>
  );
}