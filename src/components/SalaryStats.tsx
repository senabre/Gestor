import React, { useState, useEffect } from 'react';
import { 
  CreditCard, TrendingUp, TrendingDown, Users, 
  DollarSign, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../hooks/useTranslation';

interface TeamStats {
  teamId: string;
  teamName: string;
  totalMembers: number;
  paidAmount: number;
  pendingAmount: number;
}

interface PaymentStats {
  totalMembers: number;
  paidMembers: number;
  pendingMembers: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  averageSalary: number;
  paymentTrend: number;
  monthlyComparison: {
    currentMonth: number;
    previousMonth: number;
    percentageChange: number;
  };
  teamStats: TeamStats[];
}

export default function SalaryStats() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<PaymentStats>({
    totalMembers: 0,
    paidMembers: 0,
    pendingMembers: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    averageSalary: 0,
    paymentTrend: 0,
    monthlyComparison: {
      currentMonth: 0,
      previousMonth: 0,
      percentageChange: 0
    },
    teamStats: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year'>('month');

  useEffect(() => {
    fetchStats();
  }, [selectedPeriod]);

  async function fetchStats() {
    try {
      setLoading(true);

      // Get date ranges
      const now = new Date();
      const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Get all teams
      const { data: teams } = await supabase
        .from('salary_teams')
        .select('*');

      // Get all players with their salaries and payments
      const { data: players, error: playersError } = await supabase
        .from('salary_players')
        .select(`
          id,
          team_id,
          player_salaries (salary),
          player_salary_payments (
            amount,
            payment_date
          )
        `);

      if (playersError) throw playersError;

      let totalAmount = 0;
      let paidAmount = 0;
      let previousMonthPaid = 0;
      let paidMembers = 0;
      const totalMembers = players?.length || 0;
      let salarySum = 0;

      // Team statistics
      const teamStats = teams?.map(team => ({
        teamId: team.id,
        teamName: team.name,
        totalMembers: 0,
        paidAmount: 0,
        pendingAmount: 0
      })) || [];

      players?.forEach(player => {
        const salary = player.player_salaries?.[0]?.salary || 0;
        totalAmount += salary;
        salarySum += salary;

        const teamStat = teamStats.find(t => t.teamId === player.team_id);
        if (teamStat) {
          teamStat.totalMembers++;
          teamStat.pendingAmount += salary;
        }

        const currentMonthPayments = player.player_salary_payments?.filter(payment => {
          const paymentDate = new Date(payment.payment_date);
          return paymentDate >= startOfCurrentMonth && paymentDate <= endOfCurrentMonth;
        });

        const previousMonthPayments = player.player_salary_payments?.filter(payment => {
          const paymentDate = new Date(payment.payment_date);
          return paymentDate >= startOfPreviousMonth && paymentDate <= endOfPreviousMonth;
        });

        const monthPaid = currentMonthPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
        const prevMonthPaid = previousMonthPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

        paidAmount += monthPaid;
        previousMonthPaid += prevMonthPaid;

        if (monthPaid >= salary) {
          paidMembers++;
        }

        if (teamStat) {
          teamStat.paidAmount += monthPaid;
          teamStat.pendingAmount -= monthPaid;
        }
      });

      const percentageChange = previousMonthPaid ? 
        ((paidAmount - previousMonthPaid) / previousMonthPaid) * 100 : 0;

      setStats({
        totalMembers,
        paidMembers,
        pendingMembers: totalMembers - paidMembers,
        totalAmount,
        paidAmount,
        pendingAmount: totalAmount - paidAmount,
        averageSalary: totalMembers ? salarySum / totalMembers : 0,
        paymentTrend: percentageChange,
        monthlyComparison: {
          currentMonth: paidAmount,
          previousMonth: previousMonthPaid,
          percentageChange
        },
        teamStats
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 dark:bg-gray-700"></div>
              <div className="h-8 bg-gray-200 rounded dark:bg-gray-700"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const mainCards = [
    {
      title: t('totalMembers'),
      value: stats.totalMembers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      title: t('completedPayments'),
      value: `${(stats.paidAmount / 100).toFixed(2)}€`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
      subtitle: t('paidMembers', { count: stats.paidMembers }),
      trend: stats.monthlyComparison.percentageChange
    },
    {
      title: t('pendingPayments'),
      value: `${(stats.pendingAmount / 100).toFixed(2)}€`,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900',
      subtitle: t('pendingMembers', { count: stats.pendingMembers })
    },
    {
      title: t('averageSalary'),
      value: `${(stats.averageSalary / 100).toFixed(2)}€`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    }
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* Period selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t('salaryStats')}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded-lg ${
              selectedPeriod === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {t('monthly')}
          </button>
          <button
            onClick={() => setSelectedPeriod('year')}
            className={`px-4 py-2 rounded-lg ${
              selectedPeriod === 'year'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {t('yearly')}
          </button>
        </div>
      </div>

      {/* Main stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</h3>
              <div className={`${card.bgColor} ${card.color} p-2 rounded-lg`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            {card.subtitle && (
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{card.subtitle}</span>
                {card.trend !== undefined && (
                  <div className={`flex items-center ml-2 ${
                    card.trend >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.trend >= 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    <span className="text-sm ml-1">
                      {Math.abs(card.trend).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Team stats */}
      <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-4">{t('teamStats')}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-3 px-4">{t('team')}</th>
                <th className="text-right py-3 px-4">{t('members')}</th>
                <th className="text-right py-3 px-4">{t('paid')}</th>
                <th className="text-right py-3 px-4">{t('pending')}</th>
                <th className="text-right py-3 px-4">{t('completion')}</th>
              </tr>
            </thead>
            <tbody>
              {stats.teamStats.map((team) => {
                const totalAmount = team.paidAmount + team.pendingAmount;
                const completionPercentage = totalAmount ? 
                  (team.paidAmount / totalAmount) * 100 : 0;

                return (
                  <tr key={team.teamId} className="border-b dark:border-gray-700">
                    <td className="py-3 px-4">{team.teamName}</td>
                    <td className="text-right py-3 px-4">{team.totalMembers}</td>
                    <td className="text-right py-3 px-4 text-green-600">
                      {(team.paidAmount / 100).toFixed(2)}€
                    </td>
                    <td className="text-right py-3 px-4 text-red-600">
                      {(team.pendingAmount / 100).toFixed(2)}€
                    </td>
                    <td className="text-right py-3 px-4">
                      <div className="flex items-center justify-end">
                        <span className="mr-2">{completionPercentage.toFixed(1)}%</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div
                            className="bg-blue-600 rounded-full h-2"
                            style={{ width: `${completionPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}