import { DEPARTMENTS } from '../../config/departments'
import { PROJECTS } from '../../config/projects'
import { useI18n } from '../../i18n/I18nProvider'
import { localized } from '../../i18n/localized'
import { useContact } from '../contact/context'
import { ArrowIcon, DepartmentGlyph, SectionHead } from '../ui'

const ProjectCard = ({ project, index }) => {
  const { t, locale } = useI18n()
  const client = localized(project.client, locale)
  return (
    <article className="project" data-reveal="up" style={{ '--d': index % 2 }}>
      {project.image ? (
        <div className="project-media framed" data-reveal="mask">
          <img src={project.image} alt="" loading="lazy" decoding="async" />
        </div>
      ) : null}
      <div className="project-meta">
        <span className="index">{t(`departments.${project.department}.name`)}</span>
        {project.year ? <span className="index">{project.year}</span> : null}
      </div>
      <h3 className="h3">{localized(project.title, locale)}</h3>
      {project.summary ? <p className="body-text">{localized(project.summary, locale)}</p> : null}
      <dl className="project-facts">
        {client ? (
          <div>
            <dt>{t('projects.client')}</dt>
            <dd>{client}</dd>
          </div>
        ) : null}
        {project.location ? (
          <div>
            <dt>{t('projects.location')}</dt>
            <dd>{project.location}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  )
}

const ReferencesOnRequest = () => {
  const { t } = useI18n()
  const { requestContact } = useContact()
  return (
    <div className="projects-empty is-dark">
      <div className="projects-empty-text">
        <p className="projects-empty-title serif" data-reveal="up">
          {t('projects.emptyTitle')}
        </p>
        <p className="body-text" data-reveal="up" style={{ '--d': 1 }}>
          {t('projects.emptyText')}
        </p>
        <button type="button" className="btn btn-solid" data-reveal="up" style={{ '--d': 2 }} onClick={() => requestContact({ type: 'contact' })}>
          <span>{t('projects.emptyCta')}</span>
          <ArrowIcon />
        </button>
      </div>
      <ul className="projects-departments">
        {DEPARTMENTS.map((item, index) => (
          <li key={item.id} data-reveal="up" style={{ '--d': index }}>
            <button type="button" onClick={() => requestContact({ type: 'contact', department: item.id })}>
              <span className="index">{item.number}</span>
              <DepartmentGlyph id={item.id} />
              <span className="projects-department-name">{t(`departments.${item.id}.name`)}</span>
              <span className="projects-department-action">
                <span className="projects-department-label">{t('projects.emptyCta')}</span>
                <ArrowIcon />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export const Projects = () => {
  const { t } = useI18n()
  return (
    <section className="section projects is-light" id="projects" aria-labelledby="projects-title">
      <div className="container">
        <SectionHead id="projects-title" eyebrow={t('projects.eyebrow')} title={t('projects.title')} accent={t('projects.titleAccent')} />
        {PROJECTS.length ? (
          <div className="projects-grid">
            {PROJECTS.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        ) : (
          <ReferencesOnRequest />
        )}
      </div>
    </section>
  )
}

export default Projects
