import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, TextInput, Select, Switch } from '@gravity-ui/uikit';
import { DatePicker } from '@gravity-ui/date-components';
import { dateTime } from '@gravity-ui/date-utils';
import type { Deposit, PaymentPeriod, DepositStatus } from '../types';
import { ColorPicker } from './ColorPicker';
import { getBankColor } from '../utils/calculations';

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
  capitalization: boolean;
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

const BANK_OPTIONS = [
  { value: '', content: '— Не указан —' },
  { value: 'Сбербанк', content: 'Сбербанк' },
  { value: 'Альфа-Банк', content: 'Альфа-Банк' },
  { value: 'Т-Банк', content: 'Т-Банк' },
  { value: 'ВТБ', content: 'ВТБ' },
  { value: 'Газпромбанк', content: 'Газпромбанк' },
  { value: 'Росбанк', content: 'Росбанк' },
  { value: 'Райффайзенбанк', content: 'Райффайзенбанк' },
  { value: 'Открытие', content: 'Открытие' },
  { value: 'МКБ', content: 'МКБ' },
  { value: 'Совкомбанк', content: 'Совкомбанк' },
  { value: 'ПСБ', content: 'ПСБ' },
  { value: 'Уралсиб', content: 'Уралсиб' },
  { value: 'Абсолют Банк', content: 'Абсолют Банк' },
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
    capitalization: false,
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
        capitalization: existing.capitalization,
      });
    }
  }, [existing]);

  const set = (field: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
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

  const parseDt = (d: string): ReturnType<typeof dateTime> | undefined => {
    if (!d) return undefined;
    const [y, m, day] = d.split('-').map(Number);
    return dateTime({ timeZone: 'UTC' }).year(y).month(m).date(day);
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
      bank: form.bank || undefined,
      status: form.status,
      color: form.color,
      capitalization: form.capitalization,
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
              placeholder="Например: Накопительный"
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
            <Select
              size="l"
              value={[form.bank]}
              onUpdate={([v]) => {
                set('bank', v ?? '');
                if (v) {
                  set('color', getBankColor(v));
                }
              }}
              options={BANK_OPTIONS}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-section__title">Даты</div>

          <div className="form-row form-row--inline">
            <div>
              <div className="form-label">Дата открытия *</div>
              <DatePicker
                size="l"
                value={parseDt(form.openDate)}
                onUpdate={(dt) => {
                  const val = dt ? `${dt.year()}-${String(dt.month()).padStart(2, '0')}-${String(dt.date()).padStart(2, '0')}` : '';
                  set('openDate', val);
                }}
                validationState={errors.openDate ? 'invalid' : undefined}
                errorMessage={errors.openDate}
              />
            </div>
            <div>
              <div className="form-label">Дата окончания</div>
              <DatePicker
                size="l"
                value={parseDt(form.endDate)}
                onUpdate={(dt) => {
                  const val = dt ? `${dt.year()}-${String(dt.month()).padStart(2, '0')}-${String(dt.date()).padStart(2, '0')}` : '';
                  set('endDate', val);
                }}
                validationState={errors.endDate ? 'invalid' : undefined}
                errorMessage={errors.endDate}
              />
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
            <div className="form-label">Капитализация процентов</div>
            <Switch
              checked={form.capitalization}
              onUpdate={v => set('capitalization', v)}
            >
              Капитализация процентов
            </Switch>
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
