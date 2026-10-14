import { ContactSection } from '../contact/ContactSection'
import { About } from '../sections/About'
import { Careers } from '../sections/Careers'
import { Commitments } from '../sections/Commitments'
import { Expertises } from '../sections/Expertises'
import { Hero } from '../sections/Hero'
import { Projects } from '../sections/Projects'
import { Why } from '../sections/Why'
import '../sections/sections.css'

export const HomePage = () => (
  <>
    <Hero />
    <About />
    <Expertises />
    <Why />
    <Commitments />
    <Projects />
    <Careers />
    <ContactSection />
  </>
)

export default HomePage
