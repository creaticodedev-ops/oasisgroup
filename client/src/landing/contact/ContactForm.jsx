import { useEffect, useRef, useState } from 'react'
import { DEPARTMENTS } from '../../config/departments'
import { SITE } from '../../config/site'
import { useI18n } from '../../i18n/I18nProvider'
import { ArrowIcon } from '../ui'
import { contactAvailability, submitInquiry } from './api'
import { REQUEST_TYPES, useContact } from './context'
import { DEFAULT_COUNTRY, isInternational, parsePhone } from './phone'
import { PhoneField } from './PhoneField'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MESSAGE_MIN = 20
const FIELD_ERRORS = ['email', 'phone', 'message', 'consent']

const emptyValues = (type = 'quote', department = '') => ({
  type,
  department,
  firstName: '',
  lastName: '',
  company: '',
  email: '',
  phone: '',
  phoneCountry: DEFAULT_COUNTRY,
  city: '',
  message: '',
  consent: false,
  website: '',
})

const validate = (values) => {
  const errors = {}
  if (values.firstName.trim().length < 2) errors.firstName = 'required'
  if (values.lastName.trim().length < 2) errors.lastName = 'required'
  if (!EMAIL.test(values.email.trim())) errors.email = values.email.trim() ? 'email' : 'required'
  if (!parsePhone(values.phone, values.phoneCountry)) errors.phone = values.phone.trim() ? 'phone' : 'required'
  if (values.message.trim().length < MESSAGE_MIN) errors.message = values.message.trim() ? 'message' : 'required'
  if (!values.consent) errors.consent = 'consent'
  return errors
}

const Field = ({ id, label, hint, error, errorText, multiline = false, ...input }) => {
  const Control = multiline ? 'textarea' : 'input'
  return (
    <div className={`field${error ? ' has-error' : ''}${multiline ? ' is-multiline' : ''}`}>
      <label htmlFor={id}>
        {label}
        {hint ? <span className="field-hint">{hint}</span> : null}
      </label>
      <div className="field-control">
        <Control id={id} name={id} aria-invalid={error ? 'true' : undefined} aria-describedby={error ? `${id}-error` : undefined} {...input} />
      </div>
      <p className="field-error" id={`${id}-error`} aria-live="polite">
        {error ? errorText : ''}
      </p>
    </div>
  )
}

/** Shown instead of the form while e-mail delivery is not configured: no request can be lost. */
const FormOffline = () => {
  const { t } = useI18n()
  const { email, phone, whatsapp } = SITE.contact
  const links = [
    email && { key: 'email', href: `mailto:${email}`, value: email },
    phone && { key: 'phone', href: `tel:${phone.replace(/\s+/g, '')}`, value: phone },
    whatsapp && { key: 'whatsapp', href: `https://wa.me/${whatsapp.replace(/\D/g, '')}`, value: whatsapp, external: true },
  ].filter(Boolean)

  return (
    <div className="form-offline" role="status">
      <h3 className="h3">{t('contact.form.offline.title')}</h3>
      <p>{t(links.length ? 'contact.form.offline.text' : 'contact.form.offline.textNoContact')}</p>
      {links.length ? (
        <ul className="form-offline-links">
          {links.map((item) => (
            <li key={item.key}>
              <a
                className="btn btn-line"
                href={item.href}
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span>
                  {t(`contact.form.offline.${item.key}`)} <span dir="ltr">{item.value}</span>
                  {item.external ? <span className="sr-only"> {t('common.newTab')}</span> : null}
                </span>
                <ArrowIcon />
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export const ContactForm = ({ defaultDepartment = '' }) => {
  const { t, locale } = useI18n()
  const { intent } = useContact()
  const [available, setAvailable] = useState(null)
  const [values, setValues] = useState(() => emptyValues('quote', defaultDepartment))
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState(false)
  const [status, setStatus] = useState('idle')
  const [serverError, setServerError] = useState('')
  const [sentTo, setSentTo] = useState('')
  const formRef = useRef(null)
  const doneRef = useRef(null)

  useEffect(() => {
    let active = true
    contactAvailability().then((value) => {
      if (active) setAvailable(value)
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (status === 'done') doneRef.current?.focus()
  }, [status])

  useEffect(() => {
    if (!intent) return
    setStatus((current) => (current === 'done' ? 'idle' : current))
    setValues((current) => ({
      ...current,
      type: REQUEST_TYPES.includes(intent.type) ? intent.type : current.type,
      department: intent.department || current.department,
    }))
  }, [intent])

  const change = (patch) => {
    const next = { ...values, ...patch }
    setValues(next)
    if (touched) setErrors(validate(next))
  }

  const update = (key) => (event) => change({ [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value })

  const phonePatch = (raw) => {
    const parsed = parsePhone(raw, values.phoneCountry)
    return parsed?.country ? { phone: parsed.formatNational(), phoneCountry: parsed.country } : { phone: raw }
  }

  const onPhoneChange = (event) => {
    const raw = event.target.value
    change(raw.length - values.phone.length > 1 && isInternational(raw) ? phonePatch(raw) : { phone: raw })
  }

  const onPhoneBlur = () => {
    const patch = phonePatch(values.phone)
    if (patch.phone !== values.phone || patch.phoneCountry) change(patch)
  }

  const departmentName = (id) => (id ? t(`departments.${id}.name`) : t('common.group'))

  const onSubmit = async (event) => {
    event.preventDefault()
    setTouched(true)
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length) {
      formRef.current?.querySelector(`[name="${Object.keys(found)[0]}"]`)?.focus()
      return
    }
    setStatus('sending')
    setServerError('')
    const phone = parsePhone(values.phone, values.phoneCountry)
    try {
      await submitInquiry({
        type: values.type,
        department: values.department || 'group',
        firstName: values.firstName,
        lastName: values.lastName,
        company: values.company,
        email: values.email.trim(),
        phone: phone.number,
        phoneCountry: phone.country || values.phoneCountry,
        city: values.city,
        message: values.message,
        consent: values.consent,
        website: values.website,
        locale,
      })
      setSentTo(departmentName(values.department))
      setStatus('done')
    } catch (error) {
      setStatus('idle')
      if (error.status === 503 && error.body?.code === 'not_configured') {
        setAvailable(false)
      } else if (error.status === 422 && error.body?.fields) {
        setErrors(Object.fromEntries(Object.keys(error.body.fields).map((key) => [key, FIELD_ERRORS.includes(key) ? key : 'required'])))
      } else {
        setServerError(t(error.status === 429 ? 'contact.form.errors.rate' : 'contact.form.errors.server'))
      }
    }
  }

  const reset = () => {
    setValues(emptyValues(values.type, values.department))
    setErrors({})
    setTouched(false)
    setStatus('idle')
  }

  const errorText = (key) => t(`contact.form.errors.${FIELD_ERRORS.includes(errors[key]) ? errors[key] : 'required'}`)
  const optional = `(${t('contact.form.optional')})`

  if (available === false) return <FormOffline />

  if (status === 'done') {
    return (
      <div className="form-done" role="status" tabIndex={-1} ref={doneRef}>
        <svg className="form-check" viewBox="0 0 72 72" aria-hidden="true">
          <circle cx="36" cy="36" r="34" />
          <path d="M23 37l9 9 18-20" />
        </svg>
        <h3 className="h3">{t('contact.form.success.title')}</h3>
        <p>{t('contact.form.success.text', { name: values.firstName.trim(), department: sentTo })}</p>
        <button type="button" className="link-arrow" onClick={reset}>
          <span>{t('contact.form.success.again')}</span>
          <ArrowIcon />
        </button>
      </div>
    )
  }

  return (
    <form ref={formRef} className="contact-form" noValidate onSubmit={onSubmit}>
      <fieldset className="segmented">
        <legend>{t('contact.form.type')}</legend>
        <div className="segmented-options">
          {REQUEST_TYPES.map((type) => (
            <label key={type} className="segmented-option">
              <input type="radio" name="type" value={type} checked={values.type === type} onChange={update('type')} />
              <span>{t(`contact.form.types.${type}`)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field is-select">
        <label htmlFor="department">{t('contact.form.department')}</label>
        <div className="field-control">
          <select id="department" name="department" value={values.department} onChange={update('department')}>
            <option value="">{t('contact.form.groupOption')}</option>
            {DEPARTMENTS.map((item) => (
              <option key={item.id} value={item.id}>
                {t(`departments.${item.id}.name`)} — {t(`departments.${item.id}.domain`)}
              </option>
            ))}
          </select>
          <svg className="select-caret" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </div>
        <p className="field-error" />
      </div>

      <div className="form-row">
        <Field
          id="firstName"
          label={t('contact.form.firstName')}
          autoComplete="given-name"
          value={values.firstName}
          onChange={update('firstName')}
          error={errors.firstName}
          errorText={errorText('firstName')}
          maxLength={60}
        />
        <Field
          id="lastName"
          label={t('contact.form.lastName')}
          autoComplete="family-name"
          value={values.lastName}
          onChange={update('lastName')}
          error={errors.lastName}
          errorText={errorText('lastName')}
          maxLength={60}
        />
      </div>

      <div className="form-row">
        <Field
          id="company"
          label={t(values.type === 'career' ? 'contact.form.position' : 'contact.form.company')}
          hint={optional}
          autoComplete={values.type === 'career' ? 'off' : 'organization'}
          value={values.company}
          onChange={update('company')}
          maxLength={120}
        />
        <Field
          id="city"
          label={t('contact.form.city')}
          hint={optional}
          autoComplete="address-level2"
          value={values.city}
          onChange={update('city')}
          maxLength={80}
        />
      </div>

      <div className="form-row">
        <Field
          id="email"
          type="email"
          label={t('contact.form.email')}
          autoComplete="email"
          inputMode="email"
          dir="ltr"
          value={values.email}
          onChange={update('email')}
          error={errors.email}
          errorText={errorText('email')}
          maxLength={254}
        />
        <PhoneField
          id="phone"
          label={t('contact.form.phone')}
          locale={locale}
          t={t}
          country={values.phoneCountry}
          onCountry={(code) => change({ phoneCountry: code })}
          value={values.phone}
          onChange={onPhoneChange}
          onBlur={onPhoneBlur}
          error={errors.phone}
          errorText={errorText('phone')}
        />
      </div>

      <Field
        id="message"
        multiline
        rows={5}
        label={t('contact.form.message')}
        placeholder={t(`contact.form.placeholders.${values.type}`)}
        value={values.message}
        onChange={update('message')}
        error={errors.message}
        errorText={errorText('message')}
        maxLength={3000}
      />

      <div className="form-honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={update('website')} />
      </div>

      <div className={`consent${errors.consent ? ' has-error' : ''}`}>
        <label className="consent-label">
          <input
            type="checkbox"
            name="consent"
            checked={values.consent}
            onChange={update('consent')}
            aria-invalid={errors.consent ? 'true' : undefined}
            aria-describedby={errors.consent ? 'consent-error' : undefined}
          />
          <span className="consent-box" aria-hidden="true" />
          <span>{t('contact.form.consent')}</span>
        </label>
        <p className="field-error" id="consent-error" aria-live="polite">
          {errors.consent ? errorText('consent') : ''}
        </p>
      </div>

      {serverError ? (
        <p className="form-alert" role="alert">
          {serverError}
        </p>
      ) : null}

      <button type="submit" className="btn btn-solid form-submit" disabled={status === 'sending'}>
        <span>{t(status === 'sending' ? 'contact.form.sending' : 'contact.form.submit')}</span>
        {status === 'sending' ? <i className="spinner" aria-hidden="true" /> : <ArrowIcon />}
      </button>
    </form>
  )
}

export default ContactForm
