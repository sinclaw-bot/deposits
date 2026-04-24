import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@gravity-ui/uikit';
import { TrashBin, Pencil, Ellipsis } from '@gravity-ui/icons';
import type { Deposit } from '../types';
import {
  calcAvgMonthlyIncome,
  calcPaymentProgress,
  calcNextPayoutDate,
  formatCurrencyShort,
  formatRate,
} from '../utils/calculations';

interface DepositCardProps {
  deposit: Deposit;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DepositCard({ deposit, onEdit, onDelete }: DepositCardProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const monthlyIncome = calcAvgMonthlyIncome(deposit);
  const paymentProgress = calcPaymentProgress(deposit);
  const nextPayoutDate = calcNextPayoutDate(deposit);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  function formatDate(d: Date): string {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  }

  const periodLabel =
    deposit.paymentPeriod === 'monthly' ? 'Ежемес.' :
    deposit.paymentPeriod === 'quarterly' ? 'Ежекварт.' :
    deposit.paymentPeriod === 'yearly' ? 'Ежегодно' : 'В конце';

  const incomeLabel = deposit.paymentPeriod === 'end'
    ? `~${formatCurrencyShort(monthlyIncome)}/мес`
    : `+${formatCurrencyShort(monthlyIncome)}/мес`;

  return (
    <div className="deposit-card" onClick={() => navigate(`/edit/${deposit.id}`)}>
      <div className="deposit-card__body">
        <div className="deposit-card__header">
          <div>
            <div className="deposit-card__name">{deposit.name}</div>
            {deposit.bank && (
              <div className="deposit-card__bank">
                <span
                  className="deposit-card__color-dot"
                  style={{ backgroundColor: deposit.color }}
                />
                {deposit.bank}
              </div>
            )}
          </div>
          <div className="deposit-card__header-right">
            {deposit.status === 'closed' && (
              <span className="status-badge status-badge--closed">Закрыт</span>
            )}
            <div className="deposit-card__menu-wrapper" ref={menuRef}>
              <button
                className="deposit-card__menu-btn"
                onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
                aria-label="Действия"
              >
                <Icon data={Ellipsis} size={18} />
              </button>
              {menuOpen && (
                <div className="deposit-card__menu-dropdown">
                  <button
                    className="deposit-card__menu-item"
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); onEdit(deposit.id); }}
                  >
                    <Icon data={Pencil} size={14} /> Редактировать
                  </button>
                  <button
                    className="deposit-card__menu-item deposit-card__menu-item--danger"
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); onDelete(deposit.id); }}
                  >
                    <Icon data={TrashBin} size={14} /> Удалить
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="deposit-card__main-row">
          <div className="deposit-card__amount">
            {formatCurrencyShort(deposit.amount)}
          </div>
          <div className="deposit-card__income-tag">
            {incomeLabel}
          </div>
        </div>

        <div className="deposit-card__stats-row">
          <div className="deposit-card__stat">
            <span className="deposit-card__stat-label">Ставка</span>
            <span className="deposit-card__stat-value">{formatRate(deposit.interestRate, deposit.capitalization)}</span>
          </div>
          <div className="deposit-card__stat">
            <span className="deposit-card__stat-label">Выплаты</span>
            <span className="deposit-card__stat-value">{periodLabel}</span>
          </div>
          {nextPayoutDate && (
            <div className="deposit-card__stat">
              <span className="deposit-card__stat-label">Выплата</span>
              <span className="deposit-card__stat-value">{formatDate(nextPayoutDate)}</span>
            </div>
          )}
        </div>

        {paymentProgress && (
          <div className="deposit-card__progress">
            <div className="deposit-card__progress-bar">
              <div
                className="deposit-card__progress-fill"
                style={{
                  width: `${Math.round((paymentProgress.paid / paymentProgress.total) * 100)}%`,
                  backgroundColor: deposit.color,
                }}
              />
            </div>
            <div className="deposit-card__progress-label">
              {paymentProgress.paid} из {paymentProgress.total} выплат
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
