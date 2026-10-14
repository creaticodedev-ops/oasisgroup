import { useRef } from 'react'
import { DEPARTMENTS, departmentPath } from '../../config/departments'
import { useI18n } from '../../i18n/I18nProvider'
import { useElementProgress } from '../hooks'
import { BrandMark, DepartmentGlyph, Link } from '../ui'

/** Words light up as the manifesto crosses the reading zone of the viewport. */
const Manifesto = ({ text }) => {
  const ref = useRef(null)
  const words = text.split(/\s+/)

  useElementProgress(ref, (progress) => {
    const lit = Math.min(1, Math.max(0, (progress - 0.12) / 0.42))
    ref.current?.style.setProperty('--lit', lit.toFixed(3))
  })

  return (
    <p className="why-manifesto" ref={ref}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <span key={index} className="why-word" style={{ '--w': (index / words.length).toFixed(3) }}>
            {word}{' '}
          </span>
        ))}
      </span>
    </p>
  )
}

const NODE_POSITIONS = [
  { x: 50, y: 11 },
  { x: 89, y: 50 },
  { x: 50, y: 89 },
  { x: 11, y: 50 },
]

const Diagram = () => {
  const { t } = useI18n()
  return (
    <figure className="why-diagram" data-reveal="fade">
      <svg className="why-diagram-lines" viewBox="0 0 100 100" aria-hidden="true" focusable="false" data-reveal="draw">
        <circle className="why-orbit" cx="50" cy="50" r="39" pathLength="1" />
        {NODE_POSITIONS.map((node, index) => (
          <line key={index} className="why-spoke" x1="50" y1="50" x2={node.x} y2={node.y} pathLength="1" style={{ '--i': index }} />
        ))}
      </svg>
      <div className="why-core">
        <BrandMark className="why-core-mark" />
        <span>{t('why.diagramCenter')}</span>
      </div>
      <ul className="why-nodes">
        {DEPARTMENTS.map((item, index) => (
          <li key={item.id} style={{ '--x': `${NODE_POSITIONS[index].x}%`, '--y': `${NODE_POSITIONS[index].y}%`, '--i': index }}>
            <Link href={departmentPath(item)} className="why-node">
              <DepartmentGlyph id={item.id} />
              <span>{t(`departments.${item.id}.short`)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <figcaption className="sr-only">{t('why.diagramLabel')}</figcaption>
    </figure>
  )
}

export const Why = () => {
  const { t, tm } = useI18n()
  const items = tm('why.items') || []

  return (
    <section className="section why" id="why" aria-labelledby="why-title">
      <div className="container">
        <h2 className="eyebrow" id="why-title" data-reveal="fade">
          {t('why.eyebrow')}
        </h2>
        <Manifesto text={t('why.manifesto')} />

        <div className="why-grid">
          <Diagram />
          <ol className="why-items">
            {items.map((item, index) => (
              <li key={item.title} className="why-item" data-reveal="up" style={{ '--d': index % 2 }}>
                <span className="rule" data-reveal="rule" style={{ '--d': index % 2 }} aria-hidden="true" />
                <span className="index">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="h3">{item.title}</h3>
                <p className="body-text">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

export default Why
