import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextInput, Select } from '@gravity-ui/uikit';
import type { Deposit } from '../types';
import {
  calcTotalActiveAmount,
  calcTotalMonthlyIncome,
  calcTotalYearForecast,
  formatCurrencyShort,
} from '../utils/calculations';
import { DepositCard } from '../components/DepositCard';

interface DashboardPageProps {
  deposits: Deposit[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

type SortMode = 'date' | 'amount-desc' | 'rate-desc' | 'bank';

const SORT_OPTIONS = [
  { value: 'date', content: 'По дате открытия' },
  { value: 'amount-desc', content: 'По сумме (убыв.)' },
  { value: 'rate-desc', content: 'По ставке (убыв.)' },
  { value: 'bank', content: 'По банку' },
];

function sortDeposits(deposits: Deposit[], mode: SortMode): Deposit[] {
  const sorted = [...deposits];
  switch (mode) {
    case 'date':
      return sorted.sort((a, b) => new Date(b.openDate).getTime() - new Date(a.openDate).getTime());
    case 'amount-desc':
      return sorted.sort((a, b) => b.amount - a.amount);
    case 'rate-desc':
      return sorted.sort((a, b) => b.interestRate - a.interestRate);
    case 'bank':
      return sorted.sort((a, b) => {
        const bankA = a.bank || '';
        const bankB = b.bank || '';
        return bankA.localeCompare(bankB);
      });
    default:
      return sorted;
  }
}

export function DashboardPage({ deposits, onEdit, onDelete }: DashboardPageProps) {
  const navigate = useNavigate();
  const [sortMode, setSortMode] = useState<SortMode>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [bankFilter, setBankFilter] = useState<string>('all');

  // Get unique banks
  const uniqueBanks = useMemo(() => {
    const banks = new Set<string>();
    deposits.forEach(d => {
      if (d.bank) banks.add(d.bank);
    });
    return Array.from(banks).sort();
  }, [deposits]);

  const bankOptions = useMemo(() => [
    { value: 'all', content: 'Все банки' },
    ...uniqueBanks.map(b => ({ value: b, content: b })),
  ], [uniqueBanks]);

  // Filter & sort deposits
  const filteredDeposits = useMemo(() => {
    let result = [...deposits];

    // Search by name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => d.name.toLowerCase().includes(q));
    }

    // Filter by bank
    if (bankFilter !== 'all') {
      result = result.filter(d => d.bank === bankFilter);
    }

    return result;
  }, [deposits, searchQuery, bankFilter]);

  const active = sortDeposits(
    filteredDeposits.filter(d => d.status === 'active'),
    sortMode
  );
  const closed = sortDeposits(
    filteredDeposits.filter(d => d.status === 'closed'),
    sortMode
  );

  const totalAmount = calcTotalActiveAmount(deposits);
  const totalMonthly = calcTotalMonthlyIncome(deposits);
  const totalYearForecast = calcTotalYearForecast(deposits);

  return (
    <div>
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-card__label">Общая сумма</div>
          <div className="summary-card__value">{formatCurrencyShort(totalAmount)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card__label">Ежемесячный доход</div>
          <div className="summary-card__value">+{formatCurrencyShort(totalMonthly)}</div>
          <div className="summary-card__sub">
            Прогноз на год: +{formatCurrencyShort(totalYearForecast)}
          </div>
        </div>
      </div>

      <div className="section-header">
        <div className="section-header__left">
          <h2 className="section-header__title">
            Активные вклады
          </h2>
          <span className="section-header__count">{active.length}</span>
          <Select
            size="s"
            value={[sortMode]}
            onUpdate={([v]) => v && setSortMode(v as SortMode)}
            options={SORT_OPTIONS}
          />
        </div>
        <Button view="action" size="l" onClick={() => navigate('/add')}>
          + Добавить
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <TextInput
          size="s"
          value={searchQuery}
          onUpdate={setSearchQuery}
          placeholder="Поиск по названию..."
          style={{ flex: 1 }}
        />
        <Select
          size="s"
          value={[bankFilter]}
          onUpdate={([v]) => v && setBankFilter(v)}
          options={bankOptions}
          className="bank-filter-select"
        />
      </div>

      {active.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🏦</div>
          <div className="empty-state__text">
            {searchQuery || bankFilter !== 'all'
              ? 'Нет вкладов, соответствующих фильтрам'
              : 'У вас пока нет активных вкладов'}
          </div>
          <Button view="action" size="l" onClick={() => navigate('/add')}>
            Добавить первый вклад
          </Button>
        </div>
      ) : (
        <div className="deposits-grid">
          {active.map(d => (
            <DepositCard
              key={d.id}
              deposit={d}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {closed.length > 0 && (
        <>
          <div className="section-header" style={{ marginTop: 32 }}>
            <h2 className="section-header__title">Закрытые вклады</h2>
          </div>
          <div className="deposits-grid">
            {closed.map(d => (
              <DepositCard
                key={d.id}
                deposit={d}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
