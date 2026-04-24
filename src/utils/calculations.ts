import type { Deposit } from '../types';

function daysBetween(start: Date, end: Date): number {
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

/**
 * Ежемесячный доход для одного вклада.
 * Если капитализация — сложный процент, доход растёт каждый месяц.
 * Формула сложного процента: ежемесячный доход = текущая_сумма × (ставка/100/12),
 * где текущая_сумма увеличивается каждый месяц на предыдущий доход.
 * Для простого процента: сумма × (ставка / 100) / 12
 */
export function calcMonthlyIncome(deposit: Deposit): number {
  if (deposit.status !== 'active') return 0;
  if (deposit.capitalization) {
    // сложный процент: считаем доход за первый месяц
    // последующие месяцы будут выше из-за капитализации
    return deposit.amount * (deposit.interestRate / 100) / 12;
  }
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
 * Общий доход по вкладу за весь срок.
 * Для капитализации — сложный процент.
 * Для простого процента: сумма × ставка / 100 × (лет)
 */
export function calcTotalIncome(deposit: Deposit): number {
  if (deposit.status !== 'active') return 0;

  const now = new Date();
  const start = new Date(deposit.openDate);
  const end = deposit.endDate ? new Date(deposit.endDate) : now;

  const days = daysBetween(start, end);
  if (days <= 0) return 0;

  const years = days / 365;
  
  if (deposit.capitalization) {
    // сложный процент: P × (1 + r/n)^(n×t) - P, n=12
    const r = deposit.interestRate / 100;
    const n = 12;
    const t = years;
    return deposit.amount * Math.pow(1 + r / n, n * t) - deposit.amount;
  }
  
  return deposit.amount * (deposit.interestRate / 100) * years;
}

/**
 * Прогноз на год: сколько процентов будет заработано за ближайшие 12 месяцев
 * Для капитализации — сложный процент (P × (1 + r/n)^(n×t), n=12, t=1)
 */
export function calcYearForecast(deposit: Deposit): number {
  if (deposit.status !== 'active') return 0;
  if (deposit.capitalization) {
    const r = deposit.interestRate / 100;
    const n = 12;
    const t = 1;
    const total = deposit.amount * Math.pow(1 + r / n, n * t);
    return total - deposit.amount;
  }
  return deposit.amount * (deposit.interestRate / 100);
}

/**
 * Прогресс вклада по количеству выплат.
 * Возвращает { paid, total } — сколько выплат прошло и сколько всего.
 * Учитываем фактическую дату выплаты — зачисляем как paid только если
 * дата очередной выплаты уже наступила.
 */
export function calcPaymentProgress(deposit: Deposit): { paid: number; total: number } | null {
  if (!deposit.endDate || deposit.status !== 'active') return null;
  
  const openDate = new Date(deposit.openDate);
  const endDate = new Date(deposit.endDate);
  const now = new Date();
  
  let periodMonths: number;
  switch (deposit.paymentPeriod) {
    case 'monthly': periodMonths = 1; break;
    case 'quarterly': periodMonths = 3; break;
    case 'yearly': periodMonths = 12; break;
    case 'end': periodMonths = 0; break;
    default: return null;
  }
  
  if (periodMonths === 0) return null;
  
  // Всего периодов между openDate и endDate
  const totalMonths = (endDate.getFullYear() - openDate.getFullYear()) * 12 + (endDate.getMonth() - openDate.getMonth());
  const totalPayments = Math.max(1, Math.floor(totalMonths / periodMonths));
  
  // Сколько выплат реально наступило на сегодня
  let paidPayments = 0;
  const cursor = new Date(openDate);
  while (cursor <= now && paidPayments < totalPayments) {
    cursor.setMonth(cursor.getMonth() + periodMonths);
    paidPayments++;
  }
  // Если вышли за now при проверке следующей даты — последняя ещё не наступила
  if (cursor > now && paidPayments > 0) {
    paidPayments--;
  }
  
  return { paid: paidPayments, total: totalPayments };
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
 * Цветовая маркировка по банкам
 */
export function getBankColor(bank: string): string {
  const b = bank.toLowerCase();
  if (['сбер', 'сбербанк', 'sber', 'sberbank'].includes(b)) return '#21A038';
  if (['альфа', 'альфа-банк', 'alfabank', 'alfa'].includes(b)) return '#EF3124';
  if (['т-банк', 'тинькофф', 'tinkoff', 'tbank', 't-bank'].includes(b)) return '#FFDD2D';
  if (['втб', 'vtb'].includes(b)) return '#003F7D';
  if (['газпромбанк', 'gazprombank', 'газпром'].includes(b)) return '#004D99';
  if (['открытие', 'otkritie'].includes(b)) return '#B4975A';
  if (['райффайзен', 'raiffeisen'].includes(b)) return '#003E20';
  if (['росбанк', 'rosbank'].includes(b)) return '#00509E';
  return '#4DABF7';
}

/**
 * Дата следующей выплаты (ближайшая будущая от даты открытия)
 */
export function calcNextPayoutDate(deposit: Deposit): Date | null {
  if (deposit.status !== 'active') return null;
  if (!deposit.openDate) return null;
  
  const openDate = new Date(deposit.openDate);
  const now = new Date();
  
  if (deposit.paymentPeriod === 'end') {
    return deposit.endDate ? new Date(deposit.endDate) : null;
  }
  
  // период в месяцах
  let periodMonths: number;
  switch (deposit.paymentPeriod) {
    case 'monthly': periodMonths = 1; break;
    case 'quarterly': periodMonths = 3; break;
    case 'yearly': periodMonths = 12; break;
    default: return null;
  }
  
  // Идём от даты открытия вперёд, пока не перевалим за today
  const d = new Date(openDate);
  // если дата открытия в будущем — возвращаем её же
  if (d > now) return d;
  
  // Прибавляем период, пока не станет > now
  const MAX_ITER = 120; // 10 лет — безопасный лимит
  let iter = 0;
  while (d <= now && iter < MAX_ITER) {
    d.setMonth(d.getMonth() + periodMonths);
    iter++;
  }
  
  return d;
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
