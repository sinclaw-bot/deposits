import type { Deposit } from '../types';

function daysBetween(start: Date, end: Date): number {
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

/**
 * Ежемесячный доход (простой процент) для одного вклада.
 * Сумма × (ставка / 100) / 12
 */
export function calcMonthlyIncome(deposit: Deposit): number {
  if (deposit.status !== 'active') return 0;
  return deposit.amount * (deposit.interestRate / 100) / 12;
}

/**
 * Доход за месяц с учётом периодичности выплат.
 * Для ежемесячных — просто monthlyIncome.
 * Для ежеквартальных — quarterlyIncome / 3.
 * Для ежегодных — yearlyIncome / 12.
 * Для "в конце срока" — 0 в месяц (весь доход в конце).
 */
export function calcAvgMonthlyIncome(deposit: Deposit): number {
  if (deposit.status !== 'active') return 0;
  const monthly = calcMonthlyIncome(deposit);
  switch (deposit.paymentPeriod) {
    case 'monthly':
      return monthly;
    case 'quarterly':
      return (monthly * 3) / 3; // == monthly, but conceptually it's quarterly/3
    case 'yearly':
      return (monthly * 12) / 12; // == monthly
    case 'end':
      return 0;
    default:
      return monthly;
  }
}

/**
 * Общий доход по вкладу за весь срок (простой процент).
 * Для end — сумма × ставка / 100 × (лет)
 * Для остальных — сумма × ставка / 100 × (лет) (но выплачивается периодически)
 */
export function calcTotalIncome(deposit: Deposit): number {
  if (deposit.status !== 'active') return 0;

  const now = new Date();
  const start = new Date(deposit.openDate);
  const end = deposit.endDate ? new Date(deposit.endDate) : now;

  const days = daysBetween(start, end);
  if (days <= 0) return 0;

  const years = days / 365;
  return deposit.amount * (deposit.interestRate / 100) * years;
}

/**
 * Прогноз на год: сколько процентов будет заработано за ближайшие 12 месяцев
 */
export function calcYearForecast(deposit: Deposit): number {
  if (deposit.status !== 'active') return 0;
  return deposit.amount * (deposit.interestRate / 100);
}

/**
 * Прогресс вклада от 0 до 1 (на основе дат)
 */
export function calcProgress(deposit: Deposit): number {
  if (!deposit.endDate) return 0;
  const start = new Date(deposit.openDate);
  const end = new Date(deposit.endDate);
  const now = new Date();

  const total = daysBetween(start, end);
  const elapsed = daysBetween(start, now);

  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, elapsed / total));
}

/**
 * Общая сумма всех активных вкладов
 */
export function calcTotalActiveAmount(deposits: Deposit[]): number {
  return deposits
    .filter(d => d.status === 'active')
    .reduce((sum, d) => sum + d.amount, 0);
}

/**
 * Общий ежемесячный доход по всем активным вкладам
 */
export function calcTotalMonthlyIncome(deposits: Deposit[]): number {
  return deposits
    .filter(d => d.status === 'active')
    .reduce((sum, d) => sum + calcAvgMonthlyIncome(d), 0);
}

/**
 * Общий прогноз на год по всем активным вкладам
 */
export function calcTotalYearForecast(deposits: Deposit[]): number {
  return deposits
    .filter(d => d.status === 'active')
    .reduce((sum, d) => sum + calcYearForecast(d), 0);
}

/**
 * Форматирование числа в рубли
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Краткое форматирование (без копеек для больших сумм)
 */
export function formatCurrencyShort(value: number): string {
  if (Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  return formatCurrency(value);
}
