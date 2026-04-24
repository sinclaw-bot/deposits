import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextInput, Select, Icon } from '@gravity-ui/uikit';
import { Funnel, Plus, Sliders } from '@gravity-ui/icons';
import type { Deposit } from '../types';
import {
  calcTotalActiveAmount,
  calcTotalMonthlyIncome,
  calcTotalYearForecast,
  calcTotalAvgRate,
  formatCurrencyShort,
} from '../utils/calculations';
import { calcDonutSlices, DonutChart } from '../utils/donut';
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
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  // Filter deposits
  const filteredDeposits = useMemo(() => {
    let result = [...deposits];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => d.name.toLowerCase().includes(q));
    }
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

  const hasActiveFilters = searchQuery.trim() !== '' || bankFilter !== 'all';

  const totalAmount = calcTotalActiveAmount(deposits);
  const totalMonthly = calcTotalMonthlyIncome(deposits);
  const totalYearForecast = calcTotalYearForecast(deposits);
  const totalAvgRate = calcTotalAvgRate(deposits);
  const donutSlices = calcDonutSlices(deposits);

  // Stats row for summary card — like deposit card stats
  const hasCapitalization = deposits.some(d => d.status === 'active' && d.capitalization);

  return (
    <div>
      <div className="summary-card summary-card--compact">
        <div className="summary-card__row">
          <DonutChart slices={donutSlices} size={80} />
          <div className="summary-card__info">
            <div className="summary-card__main-row">
              <div className="summary-card__amount">
                {formatCurrencyShort(totalAmount)}
              </div>
              <div className="summary-card__income">
                +{formatCurrencyShort(totalMonthly)}/мес
              </div>
            </div>
            <div className="summary-card__stats-row">
              <div className="summary-card__stat">
                <span className="summary-card__stat-label">Ставка</span>
                <span className="summary-card__stat-value">
                  {totalAvgRate.toFixed(1)}%{hasCapitalization && '*'}
                </span>
              </div>
              <div className="summary-card__stat">
                <span className="summary-card__stat-label">За год</span>
                <span className="summary-card__stat-value summary-card__stat-value--positive">
                  +{formatCurrencyShort(totalYearForecast)}
                </span>
              </div>
              <div className="summary-card__stat">
                <span className="summary-card__stat-label">Вкладов</span>
                <span className="summary-card__stat-value">{active.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-header">
        <div className="section-header__left">
          <h2 className="section-header__title">
            Активные вклады
          </h2>
          <span className="section-header__count">{active.length}</span>
        </div>
        <Button
          view={hasActiveFilters ? 'action' : 'flat'}
          size="l"
          onClick={() => setFiltersOpen(o => !o)}
        >
          <Icon data={hasActiveFilters ? Funnel : Sliders} size={18} />
        </Button>
      </div>

      {filtersOpen && (
        <div className="filters-panel">
          <TextInput
            size="l"
            value={searchQuery}
            onUpdate={setSearchQuery}
            placeholder="Поиск по названию..."
          />
          <div className="filters-panel__row">
            <Select
              size="l"
              value={[sortMode]}
              onUpdate={([v]) => v && setSortMode(v as SortMode)}
              options={SORT_OPTIONS}
            />
            <Select
              size="l"
              value={[bankFilter]}
              onUpdate={([v]) => v && setBankFilter(v)}
              options={bankOptions}
            />
          </div>
          {(hasActiveFilters) && (
            <Button
              view="outlined"
              size="l"
              onClick={() => {
                setSearchQuery('');
                setBankFilter('all');
              }}
            >
              Сбросить фильтры
            </Button>
          )}
        </div>
      )}

      {active.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🏦</div>
          <div className="empty-state__text">
            {hasActiveFilters
              ? 'Нет вкладов, соответствующих фильтрам'
              : 'У вас пока нет активных вкладов'}
          </div>
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

      {/* Floating action button */}
      <button
        className="fab"
        onClick={() => navigate('/add')}
        aria-label="Добавить вклад"
      >
        <Icon data={Plus} size={28} />
      </button>
    </div>
  );
}
