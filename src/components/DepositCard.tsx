import { useNavigate } from 'react-router-dom';
import { Button } from '@gravity-ui/uikit';
import type { Deposit } from '../types';
import {
  calcTotalIncome,
  calcAvgMonthlyIncome,
  calcProgress,
  formatCurrencyShort,
} from '../utils/calculations';

interface DepositCardProps {
  deposit: Deposit;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DepositCard({ deposit, onEdit, onDelete }: DepositCardProps) {
  const navigate = useNavigate();
  const monthlyIncome = calcAvgMonthlyIncome(deposit);
  const totalIncome = calcTotalIncome(deposit);
  const progress = calcProgress(deposit);
  const hasEndDate = !!deposit.endDate;

  return (
    <div className="deposit-card" onClick={() => navigate(`/edit/${deposit.id}`)}>
      <div
        className="deposit-card__color-bar"
        style={{ backgroundColor: deposit.color }}
      />
      <div className="deposit-card__body">
        <div className="deposit-card__header">
          <div>
            <div className="deposit-card__name">{deposit.name}</div>
            {deposit.bank && <div className="deposit-card__bank">{deposit.bank}</div>}
          </div>
          <span className={`status-badge status-badge--${deposit.status}`}>
            {deposit.status === 'active' ? 'Активен' : 'Закрыт'}
          </span>
        </div>

        <div className="deposit-card__amount">
          {formatCurrencyShort(deposit.amount)}
        </div>

        <div className="deposit-card__stats">
          <div className="deposit-card__stat">
            <span className="deposit-card__stat-label">Ставка</span>
            <span className="deposit-card__stat-value">{deposit.interestRate}%</span>
          </div>
          <div className="deposit-card__stat">
            <span className="deposit-card__stat-label">Период</span>
            <span className="deposit-card__stat-value">
              {deposit.paymentPeriod === 'monthly' ? 'Ежемес.' :
               deposit.paymentPeriod === 'quarterly' ? 'Ежекварт.' :
               deposit.paymentPeriod === 'yearly' ? 'Ежегодно' : 'В конце'}
            </span>
          </div>
          <div className="deposit-card__stat">
            <span className="deposit-card__stat-label">Доход в мес.</span>
            <span className="deposit-card__stat-value --positive">
              {deposit.paymentPeriod === 'end' ? '—' : `+${formatCurrencyShort(monthlyIncome)}`}
            </span>
          </div>
          {deposit.paymentPeriod === 'end' && (
            <div className="deposit-card__stat">
              <span className="deposit-card__stat-label">Доход всего</span>
              <span className="deposit-card__stat-value --positive">
                +{formatCurrencyShort(totalIncome)}
              </span>
            </div>
          )}
        </div>

        {hasEndDate && (
          <div className="deposit-card__progress">
            <div className="deposit-card__progress-bar">
              <div
                className="deposit-card__progress-fill"
                style={{
                  width: `${Math.round(progress * 100)}%`,
                  backgroundColor: deposit.color,
                }}
              />
            </div>
            <div className="deposit-card__progress-label">
              {Math.round(progress * 100)}% завершено
            </div>
          </div>
        )}

        <div className="deposit-card__actions" onClick={e => e.stopPropagation()}>
          <Button
            view="outlined"
            size="s"
            onClick={() => onEdit(deposit.id)}
          >
            ✏️
          </Button>
          <Button
            view="outlined-danger"
            size="s"
            onClick={() => onDelete(deposit.id)}
          >
            🗑️
          </Button>
        </div>
      </div>
    </div>
  );
}
