import { useI18n } from '../i18n/I18nProvider'
import { BarList, DailyChart, StatusBreakdown } from './charts'
import { dayKey, departmentLabel, formatClock, formatCount, formatShare, fullName, relativeTime, typeLabel } from './format'
import { ChevronIcon } from './icons'
import { useCountUp, useNow } from './hooks'
import { Avatar, ErrorState, StatusPill } from './parts'
import { useAdminText } from './strings'

const Kpi = ({ label, value, foot, accent, index, locale }) => {
  const shown = useCountUp(value)
  return (
    <article className={`adm-kpi${accent ? ' is-accent' : ''}`} style={{ '--i': index }}>
      <p className="adm-kpi-label">{label}</p>
      <p className="adm-kpi-value">{formatCount(Math.round(shown), locale)}</p>
      <p className="adm-kpi-foot">{foot}</p>
    </article>
  )
}

const Panel = ({ title, aside, className = '', children }) => (
  <section className={`adm-panel ${className}`.trim()}>
    <header className="adm-panel-head">
      <h2>{title}</h2>
      {aside}
    </header>
    {children}
  </section>
)

const OverviewSkeleton = () => (
  <div className="adm-skeleton" aria-hidden="true">
    <div className="adm-kpis">
      {[0, 1, 2, 3].map((n) => (
        <div key={n} className="adm-ghost is-kpi" />
      ))}
    </div>
    <div className="adm-grid">
      <div className="adm-ghost is-chart" />
      <div className="adm-ghost is-side" />
    </div>
  </div>
)

export const Overview = ({ stats, error, onRetry, onOpen, onViewAll }) => {
  const a = useAdminText()
  const { t, locale } = useI18n()
  const now = useNow()

  if (!stats) return error ? <ErrorState error={error} onRetry={onRetry} /> : <OverviewSkeleton />

  const { statuses, total } = stats
  const today = stats.daily.find((row) => row.day === dayKey(new Date()))?.count || 0
  const share = (count) => a('overview.kpi.share', { pct: formatShare(total ? count / total : 0, locale) })

  return (
    <div className="adm-view">
      <header className="adm-view-head">
        <div>
          <p className="kicker">{a('overview.kicker')}</p>
          <h1 className="adm-title">{a('overview.title')}</h1>
          <p className="adm-lead">{a('overview.lead')}</p>
        </div>
        <p className="adm-stamp">{a('overview.updated', { time: formatClock(stats.generatedAt, locale) })}</p>
      </header>

      <div className="adm-kpis">
        <Kpi index={0} locale={locale} label={a('overview.kpi.total')} value={total} foot={a('overview.kpi.today', { n: formatCount(today, locale) })} />
        <Kpi index={1} locale={locale} accent label={a('overview.kpi.pending')} value={statuses.pending} foot={share(statuses.pending)} />
        <Kpi index={2} locale={locale} label={a('overview.kpi.active')} value={statuses.active} foot={share(statuses.active)} />
        <Kpi index={3} locale={locale} label={a('overview.kpi.completed')} value={statuses.completed} foot={share(statuses.completed)} />
      </div>

      <div className="adm-grid">
        <Panel title={a('overview.chart.title')} aside={<span className="adm-panel-note">{a('overview.chart.period')}</span>} className="is-chart">
          <DailyChart daily={stats.daily} days={stats.days} locale={locale} />
        </Panel>

        <Panel title={a('overview.distribution')} className="is-side">
          <StatusBreakdown stats={stats} locale={locale} />
        </Panel>

        <Panel
          title={a('overview.recent')}
          className="is-recent"
          aside={
            <button type="button" className="adm-link" onClick={onViewAll}>
              {a('overview.viewAll')}
              <ChevronIcon />
            </button>
          }
        >
          {stats.latest.length ? (
            <ul className="adm-recent">
              {stats.latest.map((item) => (
                <li key={item.id}>
                  <button type="button" className="adm-recent-row" onClick={() => onOpen(item.id)}>
                    <Avatar item={item} />
                    <span className="adm-recent-id">
                      <strong dir="auto">{fullName(item)}</strong>
                      <span dir="auto">
                        {typeLabel(t, item.type)} · {relativeTime(item.createdAt, now, locale, a('justNow'))}
                      </span>
                    </span>
                    <span className="adm-recent-amount">{departmentLabel(t, item.department)}</span>
                    <StatusPill status={item.status} />
                    <ChevronIcon />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="adm-empty">{a('overview.empty')}</p>
          )}
        </Panel>

        <div className="adm-stackcol">
          <Panel title={a('overview.types')}>
            <BarList
              locale={locale}
              total={total}
              rows={Object.entries(stats.types).map(([key, count]) => ({ key, label: typeLabel(t, key), count }))}
            />
          </Panel>
          <Panel title={a('overview.departments')}>
            <BarList
              locale={locale}
              total={total}
              rows={Object.entries(stats.departments).map(([key, count]) => ({
                key,
                label: key === 'group' ? a('table.groupWide') : departmentLabel(t, key),
                count,
              }))}
            />
          </Panel>
        </div>
      </div>
    </div>
  )
}
