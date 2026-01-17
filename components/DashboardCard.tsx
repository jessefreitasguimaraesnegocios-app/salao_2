
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isUp: boolean;
  };
  colorClass?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, trend, colorClass = "bg-white" }) => {
  return (
    <div className={`p-6 rounded-2xl border border-slate-200 shadow-sm ${colorClass}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend.isUp ? '+' : '-'}{trend.value}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
    </div>
  );
};
