import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, TextInput, Select } from '@gravity-ui/uikit';
import type { Deposit, PaymentPeriod, DepositStatus } from '../types';
import { ColorPicker } from './ColorPicker';

interface DepositFormProps {
  deposits: Deposit[];
  onSave: (data: Omit<Deposit, 'id'>) => void;
  onUpdate: (id: string, data: Partial<Omit<Deposit, 'id'>>) => void;
}

interface FormData {
  name: string;
  amount: string;
  interestRate: string;
  openDate: string;
  endDate: string;
  paymentPeriod: PaymentPeriod;
  bank: string;
  status: DepositStatus;
  color: string;
}

interface FormErrors {
  name?: string;
  amount?: string;
  interestRate?: string;
  openDate?: string;
  endDate?: string;
}

const PAYMENT_OPTIONS = [
  { value: 'monthly', content: 'Ежемесячно' },
  { value: 'quarterly', content: 'Ежеквартально' },
  { value: 'yearly', content: 'Ежегодно' },
  { value: 'end', content: 'В конце срока' },
];

const STATUS_OPTIONS = [
  { value: 'active', content: 'Активен' },
  { value: 'closed', content: 'Закрыт' },
];

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function DepositForm({ deposits, onSave, onUpdate }: DepositFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const existing = isEdit ? deposits.find(d => d.id === id) : undefined;

  const [form, setForm] = useState<FormData>({
    name: '',
    amount: '',
    interestRate: '',
    openDate: todayString(),
    endDate: '',
    paymentPeriod: 'monthly',
    bank: '',
    status: 'active',
    color: '#4DABF7',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        amount: String(existing.amount),
        interestRate: String(existing.interestRate),
        openDate: existing.openDate.split('T')[0],
        endDate: existing.endDate ? existing.endDate.split('T')[0] : '',
        paymentPeriod: existing.paymentPeriod,
        bank: existing.bank || '',
        status: existing.status,
        color: existing.color,
      });
    }
  }, [existing]);

  const set = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // clear error on change
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    const amount = parseFloat(form.amount);
    const rate = parseFloat(form.interestRate);

    if (!form.name.trim()) errs.name = 'Введите название вклада';
    if (!form.amount || isNaN(amount) || amount <= 0) errs.amount = 'Сумма должна быть больше 0';
    if (!form.interestRate || isNaN(rate) || rate <= 0) errs.interestRate = 'Ставка должна быть больше 0';
    if (!form.openDate) errs.openDate = 'Выберите дату открытия';

    if (form.endDate && form.openDate) {
      if (new Date(form.endDate) <= new Date(form.openDate)) {
        errs.endDate = 'Дата окончания должна быть позже даты открытия';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: Omit<Deposit, 'id'> = {
      name: form.name.trim(),
      amount: parseFloat(form.amount),
      interestRate: parseFloat(form.interestRate),
      openDate: form.openDate,
      endDate: form.endDate || undefined,
      paymentPeriod: form.paymentPeriod,
      bank: form.bank.trim() || undefined,
      status: form.status,
      color: form.color,
    };

    if (isEdit && id) {
      onUpdate(id, data);
    } else {
      onSave(data);
    }
    navigate('/');
  };

  return (
    <div className="form-page">
      <h1 className="form-page__title">
        {isEdit ? 'Редактировать вклад' : 'Новый вклад'}
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-section__title">Основное</div>

          <div className="form-row">
            <div className="form-label">Название *</div>
            <TextInput
              size="l"
              value={form.name}
              onUpdate={v => set('name', v)}
              placeholder="Например: Сбер Вклад"
              error={errors.name}
              errorMessage={errors.name}
            />
          </div>

          <div className="form-row form-row--inline">
            <div>
              <div className="form-label">Сумма *</div>
              <TextInput
                size="l"
                type="number"
                value={form.amount}
                onUpdate={v => set('amount', v)}
                placeholder="100000"
                error={errors.amount}
                errorMessage={errors.amount}
              />
            </div>
            <div>
              <div className="form-label">Ставка (% годовых) *</div>
              <TextInput
                size="l"
                type="number"
                value={form.interestRate}
                onUpdate={v => set('interestRate', v)}
                placeholder="20"
                error={errors.interestRate}
                errorMessage={errors.interestRate}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-label">Банк</div>
            <TextInput
              size="l"
              value={form.bank}
              onUpdate={v => set('bank', v)}
              placeholder="Например: Сбербанк"
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-section__title">Даты</div>

          <div className="form-row form-row--inline">
            <div>
              <div className="form-label">Дата открытия *</div>
              <input
                type="date"
                value={form.openDate}
                onChange={e => set('openDate', e.target.value)}
                style={{
                  width: '100%',
                  height: 36,
                  padding: '0 8px',
                  borderRadius: 6,
                  border: errors.openDate ? '1px solid var(--g-color-line-danger)' : '1px solid var(--g-color-line-generic)',
                  background: 'var(--g-color-base-generic)',
                  color: 'var(--g-color-text-primary)',
                  fontSize: 15,
                  fontFamily: 'inherit',
                }}
              />
              {errors.openDate && (
                <div style={{ color: 'var(--g-color-text-danger)', fontSize: 12, marginTop: 4 }}>{errors.openDate}</div>
              )}
            </div>
            <div>
              <div className="form-label">Дата окончания</div>
              <input
                type="date"
                value={form.endDate}
                onChange={e => set('endDate', e.target.value)}
                style={{
                  width: '100%',
                  height: 36,
                  padding: '0 8px',
                  borderRadius: 6,
                  border: errors.endDate ? '1px solid var(--g-color-line-danger)' : '1px solid var(--g-color-line-generic)',
                  background: 'var(--g-color-base-generic)',
                  color: 'var(--g-color-text-primary)',
                  fontSize: 15,
                  fontFamily: 'inherit',
                }}
              />
              {errors.endDate && (
                <div style={{ color: 'var(--g-color-text-danger)', fontSize: 12, marginTop: 4 }}>{errors.endDate}</div>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section__title">Условия</div>

          <div className="form-row">
            <div className="form-label">Периодичность выплаты процентов</div>
            <Select
              size="l"
              value={[form.paymentPeriod]}
              onUpdate={([v]) => v && set('paymentPeriod', v as PaymentPeriod)}
              options={PAYMENT_OPTIONS}
            />
          </div>

          <div className="form-row">
            <div className="form-label">Статус</div>
            <Select
              size="l"
              value={[form.status]}
              onUpdate={([v]) => v && set('status', v as DepositStatus)}
              options={STATUS_OPTIONS}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-section__title">Цвет метки</div>
          <div className="form-row">
            <ColorPicker
              value={form.color}
              onChange={v => set('color', v)}
            />
          </div>
        </div>

        <div className="form-actions">
          <Button view="outlined" size="l" onClick={() => navigate('/')}>
            Отмена
          </Button>
          <Button view="action" size="l" type="submit">
            {isEdit ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </form>
    </div>
  );
}
