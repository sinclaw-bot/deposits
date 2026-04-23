import { useNavigate } from 'react-router-dom';
import { Button } from '@gravity-ui/uikit';
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

export function DashboardPage({ deposits, onEdit, onDelete }: DashboardPageProps) {
  const navigate = useNavigate();
  const active = deposits.filter(d => d.status === 'active');
  const closed = deposits.filter(d => d.status === 'closed');

  const totalAmount = calcTotalActiveAmount(deposits);
  const totalMonthly = calcTotalMonthlyIncome(deposits);
  const totalYearForecast = calcTotalYearForecast(deposits);

  return (
    <div>
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-card__label">Активных вкладов</div>
          <div className="summary-card__value">{active.length}</div>
        </div>
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
        <h2 className="section-header__title">
          Активные вклады
        </h2>
        <Button view="action" onClick={() => navigate('/add')}>
          + Добавить
        </Button>
      </div>

      {active.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🏦</div>
          <div className="empty-state__text">
            У вас пока нет активных вкладов
          </div>
          <Button view="action" onClick={() => navigate('/add')}>
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
