import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@gravity-ui/uikit';
import { TrashBin, Calendar as CalendarIcon } from '@gravity-ui/icons';
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
  onEdit?: (id: string) => void;
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

const SWIPE_THRESHOLD = 80; // px to trigger delete

export function DepositCard({ deposit, onEdit: _onEdit, onDelete }: DepositCardProps) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [swiping, setSwiping] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [hoverDelete, setHoverDelete] = useState(false);

  // Touch swipe handlers
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchActive = useRef(false);
  const currentSwipe = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchActive.current = true;
    currentSwipe.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchActive.current) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Only horizontal swipe
    if (Math.abs(dx) < Math.abs(dy) * 1.5) return;

    // Clamp: only swipe left (negative)
    const clamped = Math.min(0, dx);
    currentSwipe.current = clamped;
    setSwipeX(clamped);
    setSwiping(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchActive.current = false;
    setSwiping(false);

    if (currentSwipe.current < -SWIPE_THRESHOLD) {
      // Trigger delete confirmation
      onDelete(deposit.id);
    }

    setSwipeX(0);
    currentSwipe.current = 0;
  }, [deposit.id, onDelete]);

  // Show delete on hover (desktop)
  const handleCardClick = useCallback(() => {
    navigate(`/edit/${deposit.id}`);
  }, [navigate, deposit.id]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(deposit.id);
  }, [deposit.id, onDelete]);

  const monthlyIncome = calcAvgMonthlyIncome(deposit);
  const paymentProgress = calcPaymentProgress(deposit);
  const nextPayoutDate = calcNextPayoutDate(deposit);

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

  const swipeOffset = swiping ? swipeX : 0;

  return (
    <div className="deposit-card-wrapper">
      {/* Delete action hint on swipe */}
      {swipeX < -30 && (
        <div className="deposit-card__swipe-hint">
          <Icon data={TrashBin} size={20} />
          <span>Удалить</span>
        </div>
      )}

      <div
        ref={cardRef}
        className="deposit-card"
        style={swiping ? { transform: `translateX(${swipeOffset}px)`, transition: 'none' } : undefined}
        onClick={handleCardClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setHoverDelete(true)}
        onMouseLeave={() => setHoverDelete(false)}
      >
        <div className="deposit-card__body">
          {/* Top row: name + bank + hover delete */}
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
            {hoverDelete && (
              <button
                className="deposit-card__delete-btn"
                onClick={handleDeleteClick}
                aria-label="Удалить"
              >
                <Icon data={TrashBin} size={16} />
              </button>
            )}
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
                    <Icon data={CalendarIcon} size={12} />
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
    </div>
  );
}
