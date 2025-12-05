interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills';
  fullWidth?: boolean;
}

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  fullWidth = false,
}: TabsProps) {
  return (
    <div>
      <div className={`flex gap-2 overflow-x-auto ${fullWidth ? 'w-full' : ''}`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            type='button'
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              fullWidth ? 'flex-1' : ''
            } ${
              variant === 'pills'
                ? activeTab === tab.id
                  ? 'bg-gradient-dark rounded-lg text-white'
                  : 'rounded-lg bg-white text-gray-700 hover:bg-gray-200'
                : activeTab === tab.id
                  ? 'bg-gradient-light-blue rounded-lg text-white'
                  : 'rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.icon && <span className='flex items-center'>{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
