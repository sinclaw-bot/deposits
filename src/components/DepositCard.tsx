import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@gravity-ui/uikit';
import { TrashBin, Pencil, Ellipsis, Calendar as CalendarIcon } from '@gravity-ui/icons';
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

function TinyDonut({ paid, total, color }: { paid: number; total: number; color?: string }) {
  const size = 16;
  const stroke = 2.5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (paid / total) * circ;
  const gap = circ - dash;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="var(--g-color-line-generic)"
        strokeWidth={stroke}
        opacity={0.3}
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color || 'var(--g-color-text-primary)'}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${gap}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

export function DepositCard({ deposit, onEdit, onDelete }: DepositCardProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const monthlyIncome = calcAvgMonthlyIncome(deposit);
  const paymentProgress = calcPaymentProgress(deposit);
  const nextPayoutDate = calcNextPayoutDate(deposit);

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
    deposit.paymentPeriod === 'monthly' ? 'Ежемес' :
    deposit.paymentPeriod === 'quarterly' ? 'Ежекварт' :
    deposit.paymentPeriod === 'yearly' ? 'Ежегод' : 'В конце';

  const incomeLabel = deposit.paymentPeriod === 'end'
    ? `~${formatCurrencyShort(monthlyIncome)}/мес`
    : `+${formatCurrencyShort(monthlyIncome)}/мес`;

  // Build tags line
  const tags: { key: string; text: string; kind?: 'progress' | 'date' | 'positive' | 'pill' }[] = [];

  tags.push({ key: 'rate', text: formatRate(deposit.interestRate, deposit.capitalization) });
  tags.push({ key: 'period', text: periodLabel });

  if (paymentProgress) {
    tags.push({
      key: 'progress',
      text: `${paymentProgress.paid}/${paymentProgress.total}`,
      kind: 'progress',
    });
  }

  if (nextPayoutDate) {
    tags.push({ key: 'date', text: formatDate(nextPayoutDate), kind: 'date' });
  }

  if (deposit.status === 'closed') {
    tags.push({ key: 'closed', text: 'Закрыт', kind: 'pill' });
  }

  return (
    <div className="deposit-card" onClick={() => navigate(`/edit/${deposit.id}`)}>
      <div className="deposit-card__body">
        {/* Header: name + bank + menu */}
        <div className="deposit-card__top">
          <div className="deposit-card__top-left">
            <span className="deposit-card__name">{deposit.name}</span>
            {deposit.bank && (
              <span className="deposit-card__bank-label">
                <span
                  className="deposit-card__color-dot"
                  style={{ backgroundColor: deposit.color }}
                />
                {deposit.bank}
              </span>
            )}
          </div>
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

        {/* Amount + income */}
        <div className="deposit-card__main-row">
          <span className="deposit-card__amount">{formatCurrencyShort(deposit.amount)}</span>
          <span className="deposit-card__income-tag">{incomeLabel}</span>
        </div>

        {/* Tags row */}
        <div className="deposit-card__tags">
          {tags.map(t => {
            if (t.kind === 'progress') {
              return (
                <span key={t.key} className="deposit-card__tag">
                  <TinyDonut
                    paid={paymentProgress!.paid}
                    total={paymentProgress!.total}
                    color={deposit.color}
                  />
                  {t.text}
                </span>
              );
            }
            if (t.kind === 'pill') {
              return (
                <span key={t.key} className="deposit-card__tag deposit-card__tag--pill">
                  {t.text}
                </span>
              );
            }
            if (t.kind === 'date') {
              return (
                <span key={t.key} className="deposit-card__tag">
                  <CalendarIcon size={12} style={{ flexShrink: 0 }} />
                  {t.text}
                </span>
              );
            }
            return (
              <span key={t.key} className="deposit-card__tag">{t.text}</span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
