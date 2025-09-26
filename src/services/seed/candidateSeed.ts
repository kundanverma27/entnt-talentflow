import { faker } from '@faker-js/faker';
import { jobsSeed } from './jobsSeed';

faker.seed(54321);

export interface Candidate {
  id: string;
  name: string;
  email: string;
  stage: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  jobId: string;
  phone: string;
  resume: string;
  notes: string[];
  appliedAt: string; // ✅ ISO string for JSON
  updatedAt: string; // ✅ ISO string for JSON
  coverLetter?: string;
  experience?: string;
  skills?: string[];
  education?: string;
}

const stages: Candidate['stage'][] = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

const techSkills = [
  'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java',
  'TypeScript', 'JavaScript', 'AWS', 'Docker', 'Kubernetes',
  'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL', 'REST API',
  'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
  'Machine Learning', 'Data Science', 'DevOps', 'Frontend', 'Backend'
];

function generateCandidate(index: number, jobIds: string[]): Candidate {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const skills = faker.helpers.arrayElements(techSkills, { min: 2, max: 6 });
  const experience = `Experienced developer with ${faker.number.int({ min: 1, max: 8 })} years. Proficient in ${skills.slice(0,3).join(', ')}.`;
  const coverLetter = `Dear Hiring Manager,\n\nI am confident in my skills in ${skills.slice(0,2).join(' and ')}.\n\nBest regards,\n${firstName} ${lastName}`;

  return {
    id: `candidate-${index + 1}`,
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }),
    stage: faker.helpers.arrayElement(stages) as Candidate['stage'], // ✅ type-safe
    jobId: faker.helpers.arrayElement(jobIds),
    phone: faker.phone.number(),
    resume: faker.internet.url(),
    notes: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => faker.lorem.sentence()),
    appliedAt: faker.date.past({ years: 1 }).toISOString(), // ✅ ISO string
    updatedAt: faker.date.recent({ days: 30 }).toISOString(), // ✅ ISO string
    coverLetter,
    experience,
    skills,
    education: faker.helpers.arrayElement([
      "Bachelor's in Computer Science",
      "Master's in Software Engineering",
      "Bachelor's in Information Technology",
      "Associate's in Computer Programming",
      "Bachelor's in Engineering",
      "Master's in Computer Science",
      "Bachelor's in Mathematics",
      "PhD in Computer Science"
    ])
  };
}

const jobIds = jobsSeed.map(job => job.id);
export const candidatesSeed: Candidate[] = Array.from({ length: 1000 }, (_, i) => generateCandidate(i, jobIds));
