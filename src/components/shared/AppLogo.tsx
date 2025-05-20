import { Bot } from 'lucide-react';
import type { FC } from 'react';

const AppLogo: FC = () => {
  return (
    <div className="flex items-center gap-2">
      <Bot className="h-7 w-7 text-sidebar-primary" />
      <h1 className="text-xl font-semibold text-sidebar-foreground">AI SuperCoach</h1>
    </div>
  );
};

export default AppLogo;
